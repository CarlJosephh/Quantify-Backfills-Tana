/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Point([47.52262349217606, -18.860882546602024]);
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

var tvDataResize = ee.FeatureCollection('projects/ee-cjoseph/assets/validation_data/RandomizedTrainingDataResize')
//merge Dupuy 2021 trainig data with training data for backfills in 2017
dupuy_classes17 = dupuy_classes17.filter(ee.Filter.lte('LC', 12))/*.merge(dupuy_classes17.filter(ee.Filter.rangeContains('LC', 3, 12)))*/.merge(backfill_poly17).merge(otherBS17).merge(roofs17)
print(dupuy_classes17, 'dupuy_classes17')
//print(Dupuy)

/*Map.addLayer(dupuy_classes17,{} ,'dupuy_classes17')
Map.addLayer(viable,{} ,'viable')
*/
var trainingData = dupuy_classes17 /*tvDataResize*/
var trainingCol = 'LC'

var StartYear = 2013
var EndYear = 2022

var YearOfInterest = 2017

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

var Landsat17 = cloudfreeImage.filterDate('2016-10-01', '2017-05-01').median().set('system:id', 'I2017')//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170620');//('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170706')!!! LC08_159073_20170620<-- highCC


var LS8export = ee.ImageCollection.fromImages([
 
  Landsat17,

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
    '((RED +SWIR2) - (NIR + BLUE)) / ((RED + SWIR2) + (NIR + BLUE))', bn)
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
//print(ProcessList, 'ProcessList')
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


//print(training)

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

//!!! CONFUSION MATRIX VALIDATION
// Get a confusion matrix representing resubstitution accuracy.
var trainAccuracy = classifier.confusionMatrix();
print('Resubstitution error matrix: ', trainAccuracy);
print('Training overall accuracy: ', trainAccuracy.accuracy());
//print('kappa: ', trainAccuracy.kappa());
//print('producers Accuracy: ', trainAccuracy.producersAccuracy());
//print('consumers Accuracy: ', trainAccuracy.consumersAccuracy());


//_________________________________________________________________________
//Analyses of backfill data from the classified image
//band variable to add classification band to images
  //Get classification as a band
  var classifImg = ee.Image(Classi.first())
print(classifImg, 'classifImg')

  //create image with a 0/ 1 band signifying backfil (1) and not (0)
  //create backfill distance band
var bf1 = classifImg.eq(0).rename('BF')//give backfils a BF bandvalue of 1 and non-backfills value of 0 

//var bfDist = bf1.fastDistanceTransform({neighborhood: 1, units: 'pixels', metric: 'squared_euclidean'})
//directionalDistanceTransform(angle, maxDistance, labelBand)

var bfDist = bf1.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'}))
  .rename('BFdist')

  //create built-over distance band
var b_o1 = classifImg.eq(1).rename('b_o1')
var B_ODist = b_o1.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'}))
  .rename('B_ODist')

var Ind1 = classifImg.eq(2).rename('Ind1')
var IndDist = Ind1.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'}))
  .rename('IndDist')

var b_oi1 = ee.Image([b_o1, Ind1]).expression('B + I', {'B': b_o1.select('b_o1'), 'I': Ind1.select('Ind1')}).rename('b_oi1')
var B_OIDist = b_oi1.select('b_oi1').distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'}))
  .rename('B_OIDist')
//print(b_oiDist, 'b_oIDist')
//Map.addLayer(b_oiDist, {bands: 'B_OIdist', min: 0, max: 1000, palette: ['FFA1A1', 'FFD1A1','FFFBA1', 'F5FFA1','CCFFA1']}, 'distance to BOI', true)
  //create savannah distance band
var sav1 = classifImg.eq(3).rename('sav1')  
var svDist = sav1.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'}))
  .rename('svDist')

  //create forest distance band
var forest1 = classifImg.eq(4).rename('forest1') 
var forDist = forest1.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'}))
  .rename('forDist')

  //create water distance band
var water1 = classifImg.eq(5).rename('water1')  
var watDist = water1.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'}))
  .rename('watDist')

  //create wetland distance band
var wetland1 = classifImg.eq(6).rename('wetland1')  
var wetDist = wetland1.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'}))
  .rename('wetDist')
  
  //create rice distance band
var rice1 = classifImg.eq(7).rename('rice1')  
var riDist = rice1.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'}))
  .rename('riDist')

var wacre1 = classifImg.eq(8).rename('wacre1')  
var wacreDist = wacre1.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'}))
  .rename('wacreDist')
  
var vegC1 = classifImg.eq(9).rename('vegC1')  
var vegCDist = vegC1.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'}))
  .rename('vegCDist')
  
var rainC1 = classifImg.eq(10).rename('rainC1')  
var rainCDist = rainC1.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'}))
  .rename('rainCDist')
  
var FPbA1 = classifImg.eq(11).rename('FPbA1')  
var FPbADist = FPbA1.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'}))
  .rename('FPbADist')
  
var frui1 = classifImg.eq(12).rename('frui1')  
var fruiDist = frui1.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'}))
  .rename('fruiDist')
  
var oBS1 = classifImg.eq(13).rename('oBS1')  
var oBSDist = oBS1.distance(ee.Kernel.euclidean({radius: 3000, units: 'meters'}))
  .rename('oBSDist')
 
  
  //___________________________
  //regression analyses linear
  //add the additional analyses values as band to the bf1 image
var RegressionBands = ee.Image([
  elevation.select('elevation'), 
  slope.select('slope'),
  bfDist,
  classifImg.select('classification'),
  B_ODist,
  IndDist,
  B_OIDist,
  svDist,
  forDist,
  watDist,
  wetDist,
  riDist,
  wacreDist,
  vegCDist,
  rainCDist,
  FPbADist,
  fruiDist,
  oBSDist
  ])
  
var LinRegImage = bf1.addBands(RegressionBands)
print(LinRegImage, 'LinRegImage')

var LinRegFC = LinRegImage.sample({
      region: viable,
      scale: 30,
      factor: 1,
      geometries: false
})
print(LinRegFC.size(), 'LinRegFC')

Export.table.toDrive({
  collection: LinRegFC, 
  description: 'DataTable17', 
  folder: 'GEEData', 
  fileFormat: 'CSV', 
  selectors: ([
    //'BF', 
    'BFdist', 
    'classification', 
    'elevation', 
    'slope', 
    'B_ODist',
    'IndDist',
    //'B_OIDist',
    'svDist',
    'forDist',
    'watDist',
    'wetDist',
    'riDist',
    'wacreDist',
    'vegCDist',
    'rainCDist',
    'FPbADist',
    'fruiDist',
    'oBSDist'])
})
  
Map.addLayer(LinRegImage, {bands: 'BFdist', min: 0, max: 1000, palette: ['FFA1A1', 'FFD1A1','FFFBA1', 'F5FFA1','CCFFA1']}, 'distance to backfill',false)
Map.addLayer(LinRegImage, {bands: 'BF', min: 0, max: 1, palette: ['CCFFA1', 'FFA1A1']}, 'is backfill?', false)
Map.addLayer(LinRegImage, {bands:'classification', min: 0, max: 13, palette: ['FF4C33',    //backfill
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
                                                                  ]}, 'classi', false)