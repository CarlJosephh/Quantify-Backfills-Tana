/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = /* color: #00ffff */ee.Geometry.MultiPoint();
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/*###load images and create a collection
*/
//Load Boundary Layer
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana')
var viable = ee.FeatureCollection('projects/ee-cjoseph/assets/viable_areas')
var classes = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/classes')
var classes_poly = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/classes_poly');
var PPclasses21 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/PPclasses21');//polygons, and points from dupuy et. al.
var Dclasses = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Dclasses');
var Dupuy = ee.FeatureCollection('projects/ee-cjoseph/assets/BDDA_Tana_VF_totale_v6');
//print(Dupuy)

var trainingData = PPclasses21
var trainingCol = 'LC'
var trainingimage = Landsat21
//Map.addLayer(viable)
//________________________________________________________________________________
//IMPORT IMAGES

//Filter image collection

/*var image = ee.Image(ee.ImageCollection('LANDSAT/LC08/C01/T1')
  .filterBounds(GT)
  .filterDate('2020-05-01', '2020-06-01')
  .sort('CLOUD_COVER') //sorts for the earliest and least cloudy image
  .first());*/
  
/*var dataset = ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
    .filterBounds(GT)
    .filterDate('2016-10-01', '2017-05-01')
    //.filter(ee.Filter.calendarRange(2016, 2014, 'year'))  
    //.filter(ee.Filter.calendarRange(5, 7, 'month'))
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



var withCloudiness = dataset.map(ROICC).map(maskL8sr)

    //adjust boundary value for CC filtering
var cloudfreeImage = withCloudiness.sort('cloud').first()//filter(ee.Filter.lte('cloud', 25));//'cloud'
print(cloudfreeImage, 'fC');*/


//Map.addLayer(cloudfreeImage.mean(), {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'cloudfreeImage');


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
var Landsat21 = ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20210530');//(")may2021
var Landsat20 = ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20200527');//(")May 2020 (LC08_L1TP_159073_20200628_20200708_01_T1 ; LC08_L1TP_159073_20200714_20200722_01_T1)
var Landsat19 = ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20190610');//(")!!! June 2019 ,LC08_159073_20190610, <--highCC
var Landsat18 = ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20180506');//(")May 2018 (LC08_L1TP_159073_20180607_20180615_01_T1 ; LC08_L1TP_159073_20180623_20180703_01_T1)
var Landsat17 = ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170620');//('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170706')!!! LC08_159073_20170620<-- highCC
var Landsat16 = ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20160617');//('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20160719')July 2016
var Landsat15 = ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20150615');//(")June 2015
var Landsat14 = ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20140527');//(")may2014
var Landsat13 = ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20130609');//(")may2014

var LS8export = ee.ImageCollection.fromImages([
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

/*function clipViable(image){
  var clip = image.clip(viable);
  return clip;
  clip.rename('Landsat14') //find a way to give the output files a specific name
}*/

//_________________________________________________________________________________________
//IMAGE PREPROCESSING, Band calculations and clipping to region of interest

//load DEM
var elevation = ee.Image('USGS/SRTMGL1_003').clip(viable).select('elevation');
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
  var Br4_3 = image.expression(
    'RED / GREEN',bn)
    .rename('Br4_3')
  var Br6_2 = image.expression(
    'SWIR1 / BLUE',bn)
    .rename('Br6_2') 
  var Br7_3 = image.expression(
    'SWIR2 / RED',bn)
    .rename('Br7_3')
  var Br5_4_3 = image.expression(
    '(NIR / RED / GREEN)', bn)
    .rename('Br5_4_3')
 
  
 //Add calculated ratios and indices to the image as bands
  var newBands = ee.Image([BSI, NDVI, SCI, SBL, NDBI, NDWI, Br4_3, Br6_2, Br7_3, Br5_4_3, elevation]);
  image = image.addBands(newBands);  
  return image;
}

//execute function on image collection
var Process = LS8export.map(process);
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
var bands = ['Br4_3', 'Br6_2', 'Br7_3','BSI', 'NDVI','SCI', 'NDWI', 'NDBI', 'Br5_4_3', 'elevation']  //;  ['B2', 'B3', 'B4', 'B5', 'B6', 'B7','Br4_3', 'Br6_2', 'Br7_3', 'BSI', 'NDVI', 'SCI', 'SBL'] 
var LS8train = ee.ImageCollection.fromImages([
  Landsat21,
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
 /*var classifiersvm = ee.Classifier.libsvm({
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
  image = image.select(bands).classify(classifier)
  return image
} 

var Classi = Process.map(classify)
print(Classi,'classified')

var ClassiList = Classi.toList(Classi.size())

//!!! CONFUSION MATRIX VALIDATION
// Get a confusion matrix representing resubstitution accuracy.
var trainAccuracy = classifier.confusionMatrix();
print('Resubstitution error matrix: ', trainAccuracy);
print('Training overall accuracy: ', trainAccuracy.accuracy());

// Sample the input with a different random seed to get validation data.
/*var validation = trainer.sample({
  region: GT,
  numPixels: 5000,
  seed: 1
  // Filter the result to get rid of any null pixels.
}).filter(ee.Filter.notNull(trainer.bandNames()));

// Classify the validation data.
var validated = validation.classify(classifier);

// Get a confusion matrix representing expected accuracy.
var testAccuracy = validated.errorMatrix('LC_Type1', 'classification');
print('Validation error matrix: ', testAccuracy);
print('Validation overall accuracy: ', testAccuracy.accuracy());*/

//____________________________________________________________________________________  
//Backfill Analyses

function filterBF(image){
  image = image.lt(1)
  .selfMask()
  .rename('backfill');
  return image
}

var Backfill = Classi.map(filterBF)
print(Backfill)

var BackfillList = Backfill.toList(Backfill.size())

/*var geom18 = classified18.reduceToVectors({scale: 30, geometry: viable, labelProperty: null , bestEffort: true})
    .geometry()*/
//___________________________________________________________________________________
//Map view
Map.centerObject(GT,13)
//0 - 2021; 3 - 2018; 8 - 2013
var n = 0
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['B4', 'B3', 'B2'],  min: 0, max: 0.3}, 'true color', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['B5', 'B4', 'B3'],  min: 0, max: 0.3}, 'infrared', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['Br4_3', 'Br6_2', 'Br7_3'], min: 0.4, max: 2.5, gamma: 1.3}, 'RGB band ratios', false)
print(ee.Image(ProcessList.get(n)))

var minMaxValues = ee.Image(ProcessList.get(n)).reduceRegion({reducer: ee.Reducer.minMax(), geometry: viable});
print('minMaxValues', minMaxValues)

Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['BSI'], min: -0.3, max: 0.2, palette: ['CEFFCA','41903B', '054000']}, 'BSI', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['NDVI'],  min: -0.25, max: 0.5, palette: ['FF0000', 'FFFB00', '0FFF00']}, 'NDVI', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['SCI'], min: -0.4, max: 0.25, palette: ['FDEAEA', 'FE0000']}, 'SCI', false)


Map.addLayer(ee.Image(ClassiList.get(n)),{min:0, max:6, palette:['FF4C33','3339FF', '63FF31','76767A','D870FF', 'FFFB70', '165F00']}, 'classified', true);

Map.addLayer(ee.Image(BackfillList.get(n)),{min:0, max:3, palette:['FF4C33']}, 'backfills', true);
//(image, description, assetId, pyramidingPolicy, dimensions, region, scale, crs, crsTransform, maxPixels, shardSize
print(ee.Image(BackfillList.get(8)))

/*Export.image.toAsset({image: ee.Image(BackfillList.get(8)), region: GT, description: 'BF2013', assetId: 'BF2013', scale: 30})
Export.image.toAsset({image: ee.Image(BackfillList.get(3)), region: GT, description: 'BF2018', assetId: 'BF2018', scale: 30})
Export.image.toAsset({image: ee.Image(BackfillList.get(0)), region: GT, description: 'BF2021', assetId: 'BF2021', scale: 30})*/