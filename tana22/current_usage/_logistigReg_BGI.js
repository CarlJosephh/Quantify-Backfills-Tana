/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = 
    /* color: #98ff00 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[47.23468461991968, -18.631811558246834],
          [47.23468461991968, -19.17229067715892],
          [47.79224077226343, -19.17229067715892],
          [47.79224077226343, -18.631811558246834]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*###load images and create a collection
*/
//Load Boundary Layer
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana')
var viable = ee.FeatureCollection('projects/ee-cjoseph/assets/viable_watershed')
var classes = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/classes')
var classes_poly = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/classes_poly');
var PPclasses21 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/PPclasses21');
var Dclasses = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Dclasses');
var Dupuy = ee.FeatureCollection('projects/ee-cjoseph/assets/BDDA_Tana_VF_totale_v6');
var dupuy_classes17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/dupuy_classes17');
//var backfill_poly17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/backfill_poly17');
var backfill_poly17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Bruno_R_17/backfill_poly17_Bruno');
var otherBS17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Bruno_R_17/otherBS17_Bruno');
var roofs17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Bruno_R_17/roofs17');
var roads_ps = ee.FeatureCollection('projects/ee-cjoseph/assets/roads_ps')
var roads_pst = ee.FeatureCollection('projects/ee-cjoseph/assets/roads_pst')
var impervious = ee.Image("Tsinghua/FROM-GLC/GAIA/v10");

var tvDataResize = ee.FeatureCollection('projects/ee-cjoseph/assets/validation_data/RandomizedTrainingDataResize')

//filter road data to exclude bridges and tunnels
    roads_ps = roads_ps.filter(ee.Filter.neq('tunnel', 'T')).filter(ee.Filter.neq('bridge', 'T'))
    //create a raster containintroaddata and clip it to Greater Tana
    var road_ps_img = roads_ps.reduceToImage({properties:['code'],
                                          reducer:ee.Reducer.first()}).clip(GT)

//merge Dupuy 2021 trainig data with training data for backfills in 2017
dupuy_classes17 = dupuy_classes17.filter(ee.Filter.lte('LC', 12))/*.merge(dupuy_classes17.filter(ee.Filter.rangeContains('LC', 3, 12)))*/.merge(backfill_poly17).merge(otherBS17).merge(roofs17)
print(dupuy_classes17, 'dupuy_classes17')
//print(Dupuy)

var trainingData = dupuy_classes17 /*tvDataResize*/
var trainingCol = 'LC'

var StartYear = 2013
var EndYear = 2022

var YearOfInterest = 2014

var NumberOfTrees = 100
var seedRF = 10
//Map.addLayer(viable)
//________________________________________________________________________________
//IMPORT IMAGES

//Filter image collection

/*var image = ee.Image(ee.ImageCollection('LANDSAT/LC08/C01/T1')
  .filterBounds(GT)
  .filterDate('2020-05-01', '2020-06-01')
  .sort('CLOUD_COVER') //sorts for the earliest and least cloudy image 
  .first());*/
  
var dataset = ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
    .filterBounds(GT)
    //.filterDate('2016-10-01', '2017-05-01')
    //.filter(ee.Filter.calendarRange(2016, 2014, 'year'))  
    .filter(ee.Filter.calendarRange(10, 5, 'month'))
print(dataset, 'dataset')

function ROICC (image) {//###FUNCTION SEEMS TO ONLY WORK FOR TOA IMAGES
  var cloud = ee.Algorithms.Landsat.simpleCloudScore(image).select('cloud');//'cloud'
  var cloudiness = cloud.reduceRegion({
    reducer: 'mean', 
    geometry: GT, 
    scale: 30,
  });
  return image.set(cloudiness);
}


function maskL8sr(image) {
  // Bit 0 - Fill
  // Bit 1 - Dilated Cloud
  // Bit 2 - Cirrus
  // Bit 3 - Cloud
  // Bit 4 - Cloud Shadow
  var qaMask = image.select('QA_PIXEL').bitwiseAnd(parseInt('11111', 2)).eq(0);
  var saturationMask = image.select('QA_RADSAT').eq(0);

  // Replace the original bands with the scaled ones and apply the masks.
  return image
      .updateMask(qaMask)
      .updateMask(saturationMask);
}

var withCloudiness = dataset.map(ROICC).map(maskL8sr)

    //adjust boundary value for CC filtering
var cloudfreeImage = withCloudiness.filter(ee.Filter.lte('cloud', 25));//'cloud'
print(cloudfreeImage, 'fC', false);


//______________________________________________________________________________________
//Load Images
//for 06 an 05 2019, 2017 and 2016 have oo high CC, 17 and 16 little better in July but still problematic
var Landsat22 = cloudfreeImage.filterDate('2021-10-01', '2022-05-01').median().set('system:id', '2022')//ee.String(cloudfreeImage.filterDate('2021-10-01', '2022-05-01').first().get('system:id')).slice(-8))
var Landsat21 = cloudfreeImage.filterDate('2020-10-01', '2021-05-01').median().set('system:id', '2021') //ee.String(cloudfreeImage.filterDate('2020-10-01', '2021-05-01').first().get('system:id')).slice(-8)) //ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20210530');//(")may2021
var Landsat20 = cloudfreeImage.filterDate('2019-10-01', '2020-05-01').median().set('system:id', '2020') //ee.String(cloudfreeImage.filterDate('2019-10-01', '2020-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20200527');//(")May 2020 (LC08_L1TP_159073_20200628_20200708_01_T1 ; LC08_L1TP_159073_20200714_20200722_01_T1)
var Landsat19 = cloudfreeImage.filterDate('2018-10-01', '2019-05-01').median().set('system:id', '2019') //ee.String(cloudfreeImage.filterDate('2018-10-01', '2019-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20190610');//(")!!! June 2019 ,LC08_159073_20190610, <--highCC
var Landsat18 = cloudfreeImage.filterDate('2017-10-01', '2018-05-01').median().set('system:id', '2018') //ee.String(cloudfreeImage.filterDate('2017-10-01', '2018-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20180506');//(")May 2018 (LC08_L1TP_159073_20180607_20180615_01_T1 ; LC08_L1TP_159073_20180623_20180703_01_T1)
var Landsat17 = cloudfreeImage.filterDate('2016-10-01', '2017-05-01').median().set('system:id', '2017') //ee.String(cloudfreeImage.filterDate('2016-10-01', '2017-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170620');//('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170706')!!! LC08_159073_20170620<-- highCC
var Landsat16 = cloudfreeImage.filterDate('2015-10-01', '2016-05-01').median().set('system:id', '2016') //ee.String(cloudfreeImage.filterDate('2015-10-01', '2016-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20160617');//('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20160719')July 2016
var Landsat15 = cloudfreeImage.filterDate('2014-10-01', '2015-05-01').median().set('system:id', '2015') //ee.String(cloudfreeImage.filterDate('2014-10-01', '2015-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20150615');//(")June 2015
var Landsat14 = cloudfreeImage.filterDate('2013-10-01', '2014-05-01').median().set('system:id', '2014') //ee.String(cloudfreeImage.filterDate('2013-10-01', '2014-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20140527');//(")may2014
var Landsat13 = ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20130609')/*cloudfreeImage.filterDate('2012-10-01', '2013-05-01').median()*/.set('system:id', '2013') //ee.String(cloudfreeImage.filterDate('2012-10-01', '2013-05-01').first().get('system:id')).slice(-8))//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20130609');//(")may2014

var LS8export = ee.ImageCollection.fromImages([
  Landsat22,
  Landsat21,
  Landsat20,
  Landsat19,
  Landsat18,
  Landsat17,
  Landsat16,
  Landsat15,
  Landsat14,
  Landsat13
]);
print('LS8export: ', LS8export);


//_________________________________________________________________________________________
//IMAGE PREPROCESSING, Band calculations and clipping to region of interest
//load DEM
var elevation = ee.Image('USGS/SRTMGL1_003').clip(viable).select('elevation');
var slope = ee.Terrain.slope(elevation)
//function for clipping and calculating complex and simple band ratios
function process(image){
  //clipping the image
  var image = image.clip(viable);
  //band names
  //!!!PAY ATTENTION TO USE THE RIGHT BAND VALUES WHEN USING DATA FROM DIFFERENT LANDSAT MISSIONS!!!
  var bn = {
      'BLUE':   image.select('B2'),
      'GREEN':  image.select('B3'),
      'RED':    image.select('B4'),
      'NIR':    image.select('B5'),
      'SWIR1':  image.select('B6'),
      'SWIR2':  image.select('B7')}
  //complex band calculations
  var BSI = image.expression(//Bare Soil Index
    '((RED + SWIR2) - (NIR + BLUE)) / ((RED + SWIR2) + (NIR + BLUE))', bn) //Barest Pixel Composite for Agricultural Areas Using Landsat Time Series
    .rename('BSI');
  var NDVI = image.expression(//Normalised Difference Vegetation Index
    '(NIR - RED)/(NIR + RED)', bn)
    .rename('NDVI');
  var SCI = image.expression(//Soil Composition Index (SCI)
    '(SWIR1 - NIR)/(SWIR1 + NIR)', bn)
    .rename('SCI');
  var SBL = image.expression(//Soil Background Line (SBL)
    'NIR - (2.4*RED)', bn)
    .rename('SBL');
  var NDBI =image.expression(//Normalized Difference Built up Index :Zha, Y., J. Gao, and S. Ni. "Use of Normalized Difference Built-Up Index in Automatically Mapping Urban Areas from TM Imagery." International Journal of Remote Sensing 24, no. 3 (2003): 583-594
    '(SWIR1 - NIR) / (SWIR1 + NIR)', bn)
    .rename('NDBI')
  var NDWI = image.expression(//NDWI = (Band 3 – Band 5)/(Band 3 + Band 5)
    '(GREEN - NIR) / (GREEN + NIR)', bn)
    .rename('NDWI')
  //simple single band calculation
  //(Landsat data Ratios 1 - 3 from: May 2015 DOI:10.5194/isprsarchives-XL-7-W3-897-2015, Mwaniki et al. 2015)
  var Br4_3 = image.expression(//Mwaniki et al. 2015
    'RED / GREEN',bn)
    .rename('Br4_3')
  var Br6_2 = image.expression(//Mwaniki et al. 2015
    'SWIR1 / BLUE',bn)
    .rename('Br6_2') 
  var Br7_3 = image.expression(//Mwaniki et al. 2015
    'SWIR2 / RED',bn)
    .rename('Br7_3')
  var Br5_7 = image.expression(//Thi et al. 2019
    'NIR / SWIR2',bn)
    .rename('Br5_7')
  var Br5_4_3 = image.expression(
    '(NIR / RED / GREEN)', bn)
    .rename('Br5_4_3')
    //new indices use or not? 
   var RI = image.expression(//Redness index
    '(RED * RED) / (GREEN * GREEN)', bn)
    .rename('RI') 
  var CI = image.expression(//Colour index
    '(RED - GREEN) / (RED + GREEN)', bn)
    .rename('CI') 
  var ARVI = image.expression(//Atmospherically Resistant Vegetation Index
    '(NIR - (2 * RED) + BLUE) / (NIR + (2 * RED) + BLUE)', bn)
    .rename('ARVI') 
 
  
 //Add calculated ratios and indices to the image as bands
  var newBands = ee.Image([BSI, NDVI, SCI, SBL, NDBI, NDWI, Br4_3, Br6_2, Br7_3, Br5_4_3, elevation, slope, RI, CI, ARVI, Br5_7]);
  image = image.addBands(newBands);  
  return image;
}

//execute function on image collection
var Process = LS8export.map(process);
print(Process, 'processed');


var ProcessList = Process.toList(Process.size());
print(ProcessList, 'ProcessList')


//_____________________________________________________________________________________________________________________
//CLASSIFICATION
//Classification, train and classify

//Create training data
var bands = ['Br4_3', 'Br6_2', 'Br7_3','BSI', 'NDVI','SCI', 'NDWI', 'NDBI', 'Br5_4_3', 'elevation', 'slope', 'RI', 'CI', 'ARVI', 'Br5_7']  //;  ['B2', 'B3', 'B4', 'B5', 'B6', 'B7','Br4_3', 'Br6_2', 'Br7_4', 'BSI', 'NDVI', 'SCI', 'SBL'] 
var LS8train =  ee.ImageCollection.fromImages([
  Landsat17,
]);

var trainer = LS8train.map(process);

var trainerList = trainer.toList(trainer.size())

var training = ee.Image(trainerList.get(0)).select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
  collection: trainingData,
  properties: [trainingCol],
  scale: 30
})

//!!! SMILE CART CLSSIFICATION AND REGRESSION TREE Train the classifier
  /*var classifier = ee.Classifier.smileCart().train(training, trainingCol, bands);*/

//!!! SUPPORT VECTOR MACHINE Create an SVM classifier with custom parameters.
/* var classifiersvm = ee.Classifier.libsvm({
    kernelType: 'RBF',
    gamma: 0.5,
    cost: 30//10
  });

  // Train the classifier.
  var classifier = classifiersvm.train(training, trainingCol, bands);*/

//!!! RANDOM FOREST CLASSIFIER and train it.
var classifier = ee.Classifier.smileRandomForest({numberOfTrees: NumberOfTrees, seed: seedRF})
    .train({
      features: training,
      classProperty: trainingCol,
      inputProperties: bands,
      /*subsamplingSeed: 1*/
    });

//classification
function classify(image){
  var id = image.get('system:id')
  var imageC = image.select(bands).classify(classifier).set('system:id', id)
  return imageC
} 


var Classi = Process.map(classify)
print(Classi,'classified')

var ClassiList = Classi.toList(Classi.size())
Export.image.toAsset({image: ee.Image(ClassiList.get(5)), 
                      description: 'classi_img_2017', 
                      region: viable, 
                      scale: 30,
                      pyramidingPolicy: 'sample'
})
//!!! CONFUSION MATRIX VALIDATION
// Get a confusion matrix representing resubstitution accuracy.
var trainAccuracy = classifier.confusionMatrix();
print('Resubstitution error matrix: ', trainAccuracy);
print('Training overall accuracy: ', trainAccuracy.accuracy());
print('kappa: ', trainAccuracy.kappa());
print('producers Accuracy: ', trainAccuracy.producersAccuracy());
print('consumers Accuracy: ', trainAccuracy.consumersAccuracy());

//____________________________________________________________________________________  
//Backfill Areas
//filter the classified image for BF areas
function filterBF(image){
  var id = image.get('system:id')
  var imageB = image.eq(0)
  .selfMask()
  .rename('backfill')
  .set('system:id', id);
  return imageB
}

var Backfill = Classi.map(filterBF)
print(Backfill, 'Backfill')

//create a list of backfilled areas
var BackfillList = Backfill.toList(Backfill.size())

//backfill area increment
function BFincrement(image){
  var id = image.get('system:id')
  var yrsBefore = Backfill.filter(ee.Filter.lt('system:id', id)).mosaic()
  var mask = yrsBefore.mask(image)
  mask = mask.not()
  var masked = image.updateMask(mask)
  var incr = masked.set('system:id', id)
  
  return incr
}
//run masking function for all years but the first (no increment possible)
//and sort by system id/ Year
var maskRast = Backfill.filter(ee.Filter.gt('system:id', ee.Number(StartYear).format())).map(BFincrement).sort('system:id')
print(maskRast, 'maskRast')

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
  
    //calculate a dstance kernel to previous year B_U pixels
    var pyB_Udist = B_UB.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'})).unmask(-9999)
  
  //previous year industrial distance band
    //rename previous year band
    var IndB = oldImg.eq(2).rename('prevyrIndDist')
  
    //calculate a dstance kernel to previous year Industrial pixels
    var pyInddist = IndB.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'})).unmask(-9999)
    
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
   
  //2022 OSM road distance, primary and secondary  
    //unmask road 2022 raster and rename band                                      
    var RoadD = road_ps_img.unmask(-9999).neq(-9999).rename('RoadDist_2022')
    //calculate a distance kernel to 2022 primary and secondary roads(OSM)
    var Roadist = RoadD.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'})).unmask(-9999)
    
  //add the bands: current year image (backfill increment or classification), previous year classification
  var bdImg = pyBFdist.addBands([ image,//.unmask(-9999)
                                  Roadist,
                                  pyB_Udist, 
                                  pyInddist, 
                                  //cyB_Udist,
                                  //cyInddist,
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
Map.addLayer(ee.Image(incrementDist.filter(ee.Filter.eq('system:id', 2016)).first()), {bands: ['prevyrImperv'], min:0, max:100, palette:['FF4C33', 'F2E819']}, 'prevyrImperv2016')
Map.addLayer(ee.Image(incrementDist.filter(ee.Filter.eq('system:id', 2017)).first()), {bands: ['prevyrImperv'], min:0, max:100, palette:['FF4C33', 'F2E819']}, 'prevyrImperv2017')
Map.addLayer(ee.Image(incrementDist.first()), {bands: ['prevyrImperv'], min:0, max:100, palette:['FF4C33', 'F2E819']}, 'prevyrImperv', false)
Map.addLayer(viable, '','viable' , false)
//create an export file for the above!!!

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
                        selectors: (['Year' , 'elevation', 'slope', 'backfill', 'RoadDist_2022', 'prevyrBFDist', 'prevyrB_UDist', 'prevyrIndDist'/*, 'curryrB_UDist', 'curryrIndDist'*/, 'prevYearClassi', 'prevyrImperv'])
                        
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
                      selectors: (['Year' , 'elevation', 'slope', 'classification', 'RoadDist_2022', 'prevyrBFDist', 'prevyrB_UDist', 'prevyrIndDist'/*, 'curryrB_UDist', 'curryrIndDist'*/, 'prevYearClassi', 'prevyrImperv'])
})



