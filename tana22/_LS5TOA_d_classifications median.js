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

//merge Dupuy 2021 trainig data with training data for backfills in 2017
dupuy_classes17 = dupuy_classes17.filter(ee.Filter.lte('LC', 12))/*.merge(dupuy_classes17.filter(ee.Filter.rangeContains('LC', 3, 12)))*/.merge(backfill_poly17).merge(otherBS17).merge(roofs17)
print(dupuy_classes17, 'dupuy_classes17')
//print(Dupuy)

var trainingData = dupuy_classes17
var trainingCol = 'LC'

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

//var masked = cloudfreeImage.map(maskL8sr)
//Map.addLayer(cloudfreeImage.mean(), {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'cloudfreeImage', false);

/*var Landsat17m = cloudfreeImage.median() //.name(Landsat17)
Map.addLayer(Landsat17m, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'maskedmean', false)
print(Landsat17m, 'maskedmean') */ 

/*Map.addLayer(ee.Image('LANDSAT/LC08/C02/T1/LC08_159073_20170604'), {bands: ['B4','B3', 'B2'], min: 5000, max: 15000, gamma: 1.3});*/
  
//set Map on Tana
/*Map.centerObject(GT, 13)*/
//Map.addLayer(image, {bands: ['B4','B3', 'B2'], min: 5000, max: 15000, gamma: 1.3}, 'image');
//Export.image.toDrive({image: image, folder: 'images', scale: 30, region: GT, description: 'Landsat_full_image_2020'})
//clip to region of interest
/*var image = image.clip(GT)*/

/*var image = image.clip(viable)
print(image,'image')*/

/*Map.addLayer(viable, {color: '4CFF33'}, 'viable')
Export.table.toDrive(viable, 'viable')*/
//Export.image.toDrive({image: image, folder: 'images', scale: 30, region: GT, description: 'image_clip_ROI'})

//for 06 an 05 2019, 2017 and 2016 have oo high CC, 17 and 16 little better in July but still problematic

var Landsat17 = cloudfreeImage.filterDate('2016-10-01', '2017-05-01').median()//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170620');//('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170706')!!! LC08_159073_20170620<-- highCC


var LS8export = ee.ImageCollection.fromImages([

  Landsat17
 
]);
print('LS8export: ', LS8export);

/*function clipViable(image){
  var clip = image.clip(viable);
  return clip;
  clip.rename('Landsat14') //find a way to give the output files a specific name
}*/

//________________________images landsat 5
var dataset = ee.ImageCollection("LANDSAT/LT05/C02/T1_TOA")
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

var Landsat11 = cloudfreeImage.filterDate('2010-10-01', '2011-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2010-10-01', '2011-05-01').first().get('system:id')).slice(-8))
var Landsat9 = cloudfreeImage.filterDate('2008-10-01', '2009-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2008-10-01', '2009-05-01').first().get('system:id')).slice(-8))
var Landsat7 = cloudfreeImage.filterDate('2006-10-01', '2007-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2006-10-01', '2007-05-01').first().get('system:id')).slice(-8))
var Landsat6 = cloudfreeImage.filterDate('2005-10-01', '2006-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2005-10-01', '2006-05-01').first().get('system:id')).slice(-8))
var Landsat4 = cloudfreeImage.filterDate('2003-10-01', '2004-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2003-10-01', '2004-05-01').first().get('system:id')).slice(-8))
var Landsat1 = cloudfreeImage.filterDate('2000-10-01', '2001-05-01').median().set('system:id', ee.String(cloudfreeImage.filterDate('2000-10-01', '2001-05-01').first().get('system:id')).slice(-8))

var LS5export = ee.ImageCollection.fromImages([

  Landsat11,
  Landsat9,
  Landsat7,
  Landsat6,
  Landsat4,
  Landsat1
]);

function bandnames(image) {
  var image = image.select(['B1', 'B2', 'B3', 'B4', 'B5', 'B7'])
  image = image.rename(['B2', 'B3', 'B4', 'B5', 'B6', 'B7'])
  return image
}

LS5export = LS5export.map(bandnames)
print(LS5export, 'LS5export')


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
    '((RED + SWIR2) - (NIR + BLUE)) / ((RED + SWIR2) + (NIR + BLUE))', bn)
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
var Process = LS5export.map(process);
print(Process, 'processed');


var ProcessList = Process.toList(Process.size());
print(ProcessList, 'ProcessList')
/*###how do I use the following to display all processed images of the collection??*/
/*function addImage(image) { // display each image in collection
  var id = image.id
  var image = ee.Image(image.id)
  Map.addLayer(image, {bands: ['B4','B3', 'B2'], min: 5000, max: 15000, gamma: 1.3})
}


LS8eClip.evaluate(function(LS8eClip) {  // use map on client-side
  LS8eClip.features.map(addImage)
})*/

//_____________________________________________________________________________________________________________________
//CLASSIFICATION
//Classification, train and classify

//Create training data
var bands = ['Br4_3', 'Br6_2', 'Br7_3','BSI', 'NDVI','SCI', 'NDWI', 'NDBI', 'Br5_4_3', 'elevation', 'slope', 'RI', 'CI', 'ARVI', 'Br5_7']  //;  ['B2', 'B3', 'B4', 'B5', 'B6', 'B7','Br4_3', 'Br6_2', 'Br7_4', 'BSI', 'NDVI', 'SCI', 'SBL'] 
var LS8train = /*Landsat17m*/ ee.ImageCollection.fromImages([
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
var classifier = ee.Classifier.smileRandomForest(100)
    .train({
      features: training,
      classProperty: trainingCol,
      inputProperties: bands
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






//___________________________________________________________________________________
//Map view
Map.centerObject(GT,12)
//0 - 2021; 3 - 2018; 8 - 2013
var n = 5//4 - 2017
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['B4', 'B3', 'B2'],  min: 0, max: 0.3}, 'true color', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['B5', 'B4', 'B3'],  min: 0, max: 0.3}, 'infrared', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['Br4_3', 'Br6_2', 'Br7_3'], min: 0.4, max: 2.5, gamma: 1.3}, 'RGB band ratios', false)
//print(ee.Image(ProcessList.get(n)))

/*var minMaxValues = ee.Image(ProcessList.get(n)).reduceRegion({reducer: ee.Reducer.minMax(), geometry: viable});
print('minMaxValues', minMaxValues)*/

Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['BSI'], min: -0.3, max: 0.2, palette: ['CEFFCA','41903B', '054000']}, 'BSI', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['NDVI'],  min: -0.25, max: 0.5, palette: ['FF0000', 'FFFB00', '0FFF00']}, 'NDVI', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['SCI'], min: -0.4, max: 0.25, palette: ['FDEAEA', 'FE0000']}, 'SCI', false)


Map.addLayer(ee.Image(ClassiList.get(n)),{min:0, max:13, palette:['FF4C33',    //backfill
                                                                  '565656',   //built-up
                                                                  'A5A5A5',   //industrial (dupuy)
                                                                  'FEFFB7',   //savannah
                                                                  '146409',   //forest
                                                                  '2B41DA',   //water bodies
                                                                  '2BBFDA',   //wetland
                                                                  '46FF00',   //rice
                                                                  '5FCF35',   //watercress
                                                                  '8CE26C',   //vegetable crop
                                                                  'C6F8B3',   //rainfed crop
                                                                  'CF8EFB',   //fallows pasture bare agri soil
                                                                  'FFA2A1',   //fruit crop
                                                                  '4B2609'    //other bare soil
                                                                  ]}, 'classified', false);

Map.addLayer(ee.Image(BackfillList.get(n)),{min:0, max:1, palette:['FF4C33']}, 'backfills', false);
//(image, description, assetId, pyramidingPolicy, dimensions, region, scale, crs, crsTransform, maxPixels, shardSize
//print(ee.Image(BackfillList.get(8)))

/*Export.image.toAsset({image: ee.Image(BackfillList.get(8)), region: GT, description: 'BF2013', assetId: 'm17_BF2013', scale: 30})
Export.image.toAsset({image: ee.Image(BackfillList.get(4)), region: GT, description: 'BF2017', assetId: 'm17_BF2017', scale: 30})
Export.image.toAsset({image: ee.Image(BackfillList.get(0)), region: GT, description: 'BF2021', assetId: 'm17_BF2021', scale: 30})*/