/*###load images and create a collection
*/
//Load Boundary Layer
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana')
var viable = ee.FeatureCollection('projects/ee-cjoseph/assets/viable_areas')
var classes = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/classes')
var classes_poly = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/classes_poly');
//Map.addLayer(viable)

//________________________________________________________________________________
//IMPORT IMAGES



//set Map on Tana
Map.centerObject(GT, 13)


function scale(image){
  
  // Apply the scaling factors to the appropriate bands.
  var opticalBands = image.select('SR_B1','SR_B2','SR_B3','SR_B4','SR_B5','SR_B7').multiply(0.0000275).add(-0.2);
  var thermalBand = image.select('ST_B6').multiply(0.00341802).add(149.0);
  
  //add Bands
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBand, null, true)

}

//var composite = masked.median();//median()
var collection = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
                     /*.filterDate('1980-01-01', '2022-12-31')*/
                     .filter(ee.Filter.calendarRange(5, 7, 'month'))
                     .filterBounds(GT)
                     .filter(ee.Filter.lte('CLOUD_COVER', 10))
                     .sort('DATE_ACQUIRED');
print(collection)
var collection = collection.map(scale)
print(collection)
//var masked = collection.map(maskL457sr);
                 
//var tr21 = collection.filterDate('2021-01-01', '2021-12-31').map(maskL8sr).median()
  
  Map.addLayer(collection.first(), {bands: ['SR_B4', 'SR_B3', 'SR_B2'], min: 0, max: 0.3})//get('DATE_ACQUIRED')


var LS5_2007 = collection.filter(ee.Filter.calendarRange(2007, 2007, 'year')).sort('CLOUD_COVER').first()
var LS5_2006 = collection.filter(ee.Filter.calendarRange(2006, 2006, 'year')).sort('CLOUD_COVER').first()
var LS5_2000 = collection.filter(ee.Filter.calendarRange(2000, 2000, 'year')).sort('CLOUD_COVER').first()
var LS5_1998 = collection.filter(ee.Filter.calendarRange(1998, 1998, 'year')).sort('CLOUD_COVER').first()
var LS5_1997 = collection.filter(ee.Filter.calendarRange(1997, 1997, 'year')).sort('CLOUD_COVER').first()
var LS5_1995 = collection.filter(ee.Filter.calendarRange(1995, 1995, 'year')).sort('CLOUD_COVER').first()
var LS5_1991 = collection.filter(ee.Filter.calendarRange(1991, 1991, 'year')).sort('CLOUD_COVER').first()
var LS5_1990 = collection.filter(ee.Filter.calendarRange(1990, 1990, 'year')).sort('CLOUD_COVER').first()
//var LS5_2003 = collection.filterDate('2013-01-01', '2013-12-31').sort('CLOUD_COVER').first()


var LS5export = ee.ImageCollection.fromImages([
  LS5_2007,
  LS5_2006,
  LS5_2000,
  LS5_1998,
  LS5_1997,
  LS5_1995,
  LS5_1991,
  LS5_1990,
]);
print('LS5export: ', LS5export);

/*function clipViable(image){
  var clip = image.clip(viable);
  return clip;
  clip.rename('Landsat14') //find a way to give the output files a specific name
}*/

//_________________________________________________________________________________________
//IMAGE PREPROCESSING, Band calculations and clipping to region of interest

//function for clipping and calculating complex and simple band ratios
function process(image){
  //clipping the image
  var image = image.clip(viable);
  //band names
  //!!!PAY ATTENTION TO USE THE RIGHT BAND VALUES WHEN USING DATA FROM DIFFERENT LANDSAT MISSIONS!!!
  var bn = {
      'BLUE':   image.select('SR_B1'),
      'GREEN':  image.select('SR_B2'),
      'RED':    image.select('SR_B3'),
      'NIR':    image.select('SR_B4'),
      'SWIR1':  image.select('SR_B5'),
      'SWIR2':  image.select('SR_B7')}
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
  var newBands = ee.Image([BSI, NDVI, SCI, SBL, NDBI, Br4_3, Br6_2, Br7_3, Br5_4_3]);
  image = image.addBands(newBands);  
  return image;
}

//execute function on image collection
var Process = LS5export.map(process);
print(Process, 'processed');

Map.addLayer(ee.ImageCollection(Process).first(), {bands: ['BSI'], min: -0.3, max: 0.2, palette: ['CEFFCA','41903B', '054000']}, 'BSI')

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
var bands = ['Br4_3', 'Br6_2', 'Br7_3','BSI', 'NDVI','SCI' , 'NDBI', 'Br5_4_3']  //;  ['B2', 'B3', 'B4', 'B5', 'B6', 'B7','Br4_3', 'Br6_2', 'Br7_3', 'BSI', 'NDVI', 'SCI', 'SBL'] 
var LS8train = ee.ImageCollection.fromImages([
  LS5_2007,
  
]);

var trainer = LS8train.map(process);
var trainerList = trainer.toList(trainer.size())

var training = ee.Image(trainerList.get(0)).select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
  collection: classes,
  properties: ['landcover'],
  scale: 30
})
//print(training)

//Train the classifier
var classifier = ee.Classifier.smileCart().train(training, 'landcover', bands);

//classification
function classify(image){
  image = image.select(bands).classify(classifier)
  return image;
} 

var Classi = Process.map(classify)
print(Classi,'classified')

var ClassiList = Classi.toList(Classi.size())
//Filter for backfill
/*var classifiedCollection = classifiedCollection.lt(1)
  .selfMask()
  .rename('backfill');

var classified17 = image17.select(bands).classify(classifier);
var classified17 = classified17.lt(1)
  .selfMask()
  .rename('backfill_17');*/

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

var n = 0
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['B4', 'B3', 'B2'], min: 5000, max: 15000, gamma: 1.3}, 'true color', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['B5', 'B4', 'B3'], min: 5000, max: 15000, gamma: 1.3}, 'infrared', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['Br4_3', 'Br6_2', 'Br7_3'], min: 0.4, max: 2.5, gamma: 1.3}, 'RGB band ratios', false)
print(ee.Image(ProcessList.get(n)))



Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['BSI'], min: -0.3, max: 0.2, palette: ['CEFFCA','41903B', '054000']}, 'BSI', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['NDVI'],  min: -0.25, max: 0.5, palette: ['FF0000', 'FFFB00', '0FFF00']}, 'NDVI', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['SCI'], min: -0.4, max: 0.25, palette: ['FDEAEA', 'FE0000']}, 'SCI', false)


Map.addLayer(ee.ImageCollection(Classi).first(),{min:0, max:3, palette:['FF4C33','3339FF','76767A','4CFF33']}, 'classified', true);

Map.addLayer(ee.ImageCollection(Backfill).first(),{min:0, max:3, palette:['FF4C33']}, 'backfills', true);
