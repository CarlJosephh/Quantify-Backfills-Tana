/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var ROI_plus = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[47.23904682019184, -18.61463290676265],
          [47.23904682019184, -19.121435282813046],
          [47.77600360730121, -19.121435282813046],
          [47.77600360730121, -18.61463290676265]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
//path to model Image Classification
var ImageClassification = require('users/cjoseph/tana22:modules/3_Classification_BFArea.js');
  //import model elements
  var ClassiList = ImageClassification.ClassiList
  var Classi = ImageClassification.Classi
  var maskRast = ImageClassification.maskRast
  var StartYear = ImageClassification.StartYear
  var EndYear = ImageClassification.EndYear
  

//path to model Image collection
var collection = require('users/cjoseph/tana22:modules/1_Image_Collection_Processing.js')
  //import model elements
  var elevation = collection.elevation
  var slope = collection.Slope

//load assets
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana')
//road data sourced from open street map
var viable = ee.FeatureCollection('projects/ee-cjoseph/assets/viable_watershed')
var roads_ps_22 = ee.FeatureCollection('projects/ee-cjoseph/assets/Roads/roads_ps')
var roads_pst_22 = ee.FeatureCollection('projects/ee-cjoseph/assets/Roads/roads_pst')

//yearly roaddata, with respect to roads (primary and secondary) that were newly built between 2014 and 2022
var roads_ps_2014 = ee.FeatureCollection('projects/ee-cjoseph/assets/Roads/roads_ps_2014-2017').set('system:id', 2014)
var roads_ps_2015 = ee.FeatureCollection('projects/ee-cjoseph/assets/Roads/roads_ps_2014-2017').set('system:id', 2015)
var roads_ps_2016 = ee.FeatureCollection('projects/ee-cjoseph/assets/Roads/roads_ps_2014-2017').set('system:id', 2016)
var roads_ps_2017 = ee.FeatureCollection('projects/ee-cjoseph/assets/Roads/roads_ps_2014-2017').set('system:id', 2017)
var roads_ps_2018 = ee.FeatureCollection('projects/ee-cjoseph/assets/Roads/roads_ps_2018').set('system:id', 2018)
var roads_ps_2019 = ee.FeatureCollection('projects/ee-cjoseph/assets/Roads/roads_ps_2019-2020').set('system:id', 2019)
var roads_ps_2020 = ee.FeatureCollection('projects/ee-cjoseph/assets/Roads/roads_ps_2019-2020').set('system:id', 2020)
var roads_ps_2021 = ee.FeatureCollection('projects/ee-cjoseph/assets/Roads/roads_ps_2021').set('system:id', 2021)
var roads_ps_2022 = ee.FeatureCollection('projects/ee-cjoseph/assets/Roads/roads_ps_2022').set('system:id', 2022)
//create a List with the yearly road datasets
var roadlist = ee.List([
roads_ps_2014,
roads_ps_2015,
roads_ps_2016,
roads_ps_2017,
roads_ps_2018,
roads_ps_2019,
roads_ps_2020,
roads_ps_2021,
roads_ps_2022
])

//load GEE datasets
var impervious = ee.Image("Tsinghua/FROM-GLC/GAIA/v10");

var tvDataResize = ee.FeatureCollection('projects/ee-cjoseph/assets/validation_data/RandomizedTrainingDataResize')

//filter road data to exclude bridges and tunnels and convert it to raster data
    roads_ps_22 = roads_ps_22.filter(ee.Filter.neq('tunnel', 'T')).filter(ee.Filter.neq('bridge', 'T'))
    roads_pst_22 = roads_pst_22.filter(ee.Filter.neq('tunnel', 'T')).filter(ee.Filter.neq('bridge', 'T'))
    
roadlist = roadlist.map(function noTunnelBridge(collection){
  collection = ee.FeatureCollection(collection)
  var id = collection.get('system:id')
  var collectionfilt = collection.filter(ee.Filter.neq('tunnel', 'T')).filter(ee.Filter.neq('bridge', 'T'))
  
  var collectionImage = collectionfilt.reduceToImage({properties:['code'], reducer: ee.Reducer.first()})
  
  return collectionImage.set('system:id', id)
})
//creae an image collection from the list of yearly road images
var roadcollection = ee.ImageCollection(roadlist)

    //create a raster containintroaddata and clip it to Greater Tana
    var road_ps_22_img = roads_ps_22.reduceToImage({properties:['code'],
                                          reducer:ee.Reducer.first()}).clip(ROI_plus)
    var roads_pst_22_img = roads_pst_22.reduceToImage({properties:['code'],
                                          reducer:ee.Reducer.first()}).clip(ROI_plus)

/*Map.addLayer(roadcollection.filter(ee.Filter.eq('system:id', 2014)).first(),{} ,'roads 2014')
Map.addLayer(roadcollection.filter(ee.Filter.eq('system:id', 2022)).first(),{} ,'roads 2022')*/

/*var value = ee.Number.parse(maskRast.first().get('system:id'))
value = ee.Image(Backfill.filter(ee.Filter.eq('system:id', value.subtract(1).format())).first())//value.subtract(1)
print(value)*/

function LogregBds(image){
  //define current year system:id
  var id = ee.Number.parse(image.get('system:id'))
  
  //filter the classified collection (importantly not increment) for previous year image
  var oldImg = ee.Image(Classi.filter(ee.Filter.eq('system:id', id.subtract(1).format())).first())
  var currentImg = ee.Image(Classi.filter(ee.Filter.eq('system:id', id.format())).first())
  
  //previous year backfill distance band
    //rename previous year band
    var BFB = oldImg.eq(0).rename('prevyrBFDist')
  
    //calculate a dstance kernel to previous year BFs
    var pyBFdist = BFB.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'})).unmask(-9999)
  
  //previous year urban distance band
    //rename previous year band
    var B_UB = oldImg.eq(1).rename('prevyrB_UDist')
  
    //calculate a dstance kernel to previous year pixels
    var pyB_Udist = B_UB.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'})).unmask(-9999)
  
  //previous year industrial distance band
    //rename previous year band
    var IndB = oldImg.eq(2).rename('prevyrIndDist')
  
    //calculate a dstance kernel to previous year pixels
    var pyInddist = IndB.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'})).unmask(-9999)
    
   //previous year Waterbodies distance band
    //rename previous year band
    var WatB = oldImg.eq(5).rename('prevyrWatDist')
  
    //calculate a dstance kernel to previous year pixels
    var pyWatdist = WatB.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'})).unmask(-9999)
    
  //previous year Wetland distance band
    //rename previous year band
    var WetB = oldImg.eq(6).rename('prevyrWetDist')
  
    //calculate a dstance kernel to previous year pixels
    var pyWetdist = WetB.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'})).unmask(-9999)
    
  //previous year ricefield distance band
    //rename previous year band
    var RiceB = oldImg.eq(7).rename('prevyrRiceDist')
  
    //calculate a dstance kernel to previous year pixels
    var pyRicedist = RiceB.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'})).unmask(-9999)
    
  //previous year watercress field distance band
    //rename previous year band
    var WacreB = oldImg.eq(8).rename('prevyrWacreDist')
  
    //calculate a dstance kernel to previous year Industrial pixels
    var pyWacredist = WacreB.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'})).unmask(-9999)
    
  //current year urban distance
    //rename current year band
  //  var B_UC = currentImg.eq(1).rename('curryrB_UDist')
  
    //calculate a dstance kernel to current year B_U pixels
  //  var cyB_Udist = B_UC.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'})).unmask(-9999)
    
  //current year industrial distance
    //rename current year band
  //  var IndC = currentImg.eq(2).rename('curryrIndDist')
  
    //calculate a dstance kernel to current year industrial pixels
  //  var cyInddist = IndC.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'})).unmask(-9999)
    
  //impervious since the previous year (Gong et al. 2020)
    var pyimpervious = ee.Image(impervious.gt(ee.Number(2020).subtract(ee.Number(id)))).unmask(0).rename('prevyrImperv')
    
    var pyimpervdist = pyimpervious.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'})).unmask(-9999)
   
  //OSM road distance, primary and secondary  
    //unmask road raster and rename band                                      
    var RoadD = roadcollection.filter(ee.Filter.eq('system:id', id)).first().unmask(-9999).neq(-9999).rename('RoadDist')
    //calculate a distance kernel to  primary and secondary roads(OSM)
    var Roadist = RoadD.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'})).unmask(-9999)
  
  //OSM primary secondary and tertiary roads (only for 2022)
  var pst_22 = roads_pst_22_img.unmask(-9999).neq(-9999).rename('RoadDist_pst_22')
  
  var pstRoadist_22 = pst_22.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'})).unmask(-9999)
  
  //add the bands: current year image (backfill increment or classification), previous year classification
  var bdImg = pyBFdist.addBands([ image,//.unmask(-9999)
                                  Roadist,
                                  pstRoadist_22,
                                  pyB_Udist, 
                                  pyInddist, 
                                  //cyB_Udist,
                                  //cyInddist,
                                  pyWatdist,
                                  pyWetdist,
                                  pyRicedist,
                                  pyWacredist,
                                  ee.Image(Classi.filter(ee.Filter.eq('system:id', id.subtract(1).format())).first()).rename('prevYearClassi'),//.unmask(-9999)
                                  elevation.select('elevation'), //.unmask(-9999)
                                  slope.select('slope'),//.unmask(-9999)
                                  pyimpervdist
                                  ])
  
  var bdImgclip = bdImg.clip(GT)
  
  return bdImgclip.set('system:id', id)
}


var incrementDist = maskRast.map(LogregBds)
print(incrementDist, 'incrementDist')

//Map.addLayer(incrementDist.first(), {bands: ['prevyrBFDist'], min:0, max:100, palette:['FF4C33', 'F2E819']}, 'backfills')
//Map.addLayer(incrementDist.first(), {bands: ['prevYearClassi'], min:0, max:13, palette:['FF4C33', 'F2E819']}, 'classi')
//Map.addLayer(incrementDist.first(), {bands: ['backfill'], min:0, max:1, palette:['FF4C33']}, 'backfills')
//Map.addLayer(ee.Image(incrementDist.first()), {bands: ['RoadDist_2022'], min:0, max:100, palette:['FF4C33', 'F2E819']}, 'RoadDist_2022')
Map.addLayer(ee.Image(incrementDist.filter(ee.Filter.eq('system:id', 2016)).first()), {bands: ['RoadDist_pst_22'], min:0, max:100, palette:['FF4C33', 'F2E819']}, 'RoadDist_pst_22 2016')
Map.addLayer(ee.Image(incrementDist.filter(ee.Filter.eq('system:id', 2022)).first()), {bands: ['RoadDist_pst_22'], min:0, max:100, palette:['FF4C33', 'F2E819']}, 'RoadDist_pst_22 2022')
Map.addLayer(ee.Image(incrementDist.first()), {bands: ['prevyrImperv'], min:0, max:100, palette:['FF4C33', 'F2E819']}, 'prevyrImperv', false)
Map.addLayer(viable, '','viable' , false)


//create an export file for the above
function toFeature(image){
      var id = image.get('system:id')
      var FT = image.sample({
      region: viable,
      scale: 30,
      factor: 1,
      geometries: false})
      
      var FTY = FT.map(function fa(feat){
        var att = feat.set('Year', ee.Number.parse(id))
        return att
      })
      
      return FTY.set('system:id', id)
}

var BFincrementDist = incrementDist.map(toFeature)
print(BFincrementDist)

BFincrementDist = BFincrementDist.flatten()
//print(FincrementDist, 'FincrementDist')

Export.table.toDrive({collection: BFincrementDist,
                        folder: 'GEEData',
                        description: 'BFIncrReg',
                        fileFormat: 'CSV',
                        selectors: (['Year', 
                                    'elevation', 
                                    'slope', 
                                    'backfill', 
                                    'RoadDist',
                                    'RoadDist_pst_22',
                                    'prevyrBFDist', 
                                    'prevyrB_UDist', 
                                    'prevyrIndDist', 
                                    'prevyrWatDist',
                                    'prevyrWetDist',
                                    'prevyrRiceDist',
                                    'prevyrWacreDist',
                                    /*, 'curryrB_UDist', 'curryrIndDist'*/ 
                                    'prevYearClassi', 
                                    'prevyrImperv'])
                        
})

// map the functions over reference data for all years
var ctrlData = Classi.filter(ee.Filter.gt('system:id', ee.Number(StartYear).format())).sort('system:id')

ctrlData = ctrlData.map(LogregBds)
ctrlData = ctrlData.map(toFeature)
ctrlData = ctrlData.flatten()

//print(ctrlData, 'ctrlData')

Export.table.toDrive({collection: ctrlData,
                      folder: 'GEEData',
                      description: 'controlReg',
                      fileFormat: 'CSV',
                      selectors: (['Year' , 
                                  'elevation', 
                                  'slope', 
                                  'classification', 
                                  'RoadDist',
                                  'RoadDist_pst_22',
                                  'prevyrBFDist', 
                                  'prevyrB_UDist', 
                                  'prevyrIndDist', 
                                  'prevyrWatDist',
                                  'prevyrWetDist',
                                  'prevyrRiceDist',
                                  'prevyrWacreDist',
                                  /*, 'curryrB_UDist', 'curryrIndDist'*/ 
                                  'prevYearClassi', 
                                  'prevyrImperv'])
})


