/*###load images and create a collection
*/
//Load Boundary Layer
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana')
var viable = ee.FeatureCollection('projects/ee-cjoseph/assets/viable_areas')
var classes = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/classes')
var classes_poly = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/classes_poly');
var PPclasses21 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/PPclasses21');
//Map.addLayer(viable)

//________________________________________________________________________________
//IMPORT IMAGES



//set Map on Tana
Map.centerObject(GT, 13)

//cloudmask function
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
                   

function ROICC (image) {//###FUNCTION SEEMS TO ONLY WORK FOR TOA IMAGES
  var cloud = ee.Algorithms.Landsat.simpleCloudScore(image).select('cloud');//'cloud'
  var cloudiness = cloud.reduceRegion({
    reducer: 'mean', 
    geometry: GT, 
    scale: 30,
  });
  return image.set(cloudiness);
}

// Map the function over one year of data.
var collection = ee.ImageCollection('LANDSAT/LE07/C02/T1_TOA')
                     .filterDate('2010-01-01', '2022-01-01')
                     .filter(ee.Filter.calendarRange(10, 5, 'month'))
                     .filterBounds(GT)
                     .filter(ee.Filter.lte('CLOUD_COVER', 30));//.filter(ee.Filter.lt('CLOUD_COVER', 20)));
;
print(collection)  

var withCloudiness = collection.map(ROICC)

    //adjust boundary value for CC filtering
var filteredCollection = withCloudiness.filter(ee.Filter.lte('cloud', 10));//'cloud'
print(filteredCollection, 'fC');
                 
var masked = filteredCollection.map(maskL8sr);
print(masked)

                

var LS7_21 = masked.filterDate('2020-10-01', '2021-05-01').median()
var LS7_20 = masked.filter(ee.Filter.calendarRange(2020, 2020, 'year')).median()
var LS7_19 = masked.filter(ee.Filter.calendarRange(2019, 2019, 'year')).median()
var LS7_18 = masked.filter(ee.Filter.calendarRange(2018, 2018, 'year')).median()
var LS7_17 = masked.filter(ee.Filter.calendarRange(2017, 2017, 'year')).median()
var LS7_16 = masked.filter(ee.Filter.calendarRange(2016, 2016, 'year')).median()
var LS7_15 = masked.filter(ee.Filter.calendarRange(2015, 2015, 'year')).median()
var LS7_14 = masked.filter(ee.Filter.calendarRange(2014, 2014, 'year')).median()
var LS7_13 = masked.filter(ee.Filter.calendarRange(2013, 2013, 'year')).median()


var LS8export = ee.ImageCollection.fromImages([
  LS7_21,
  LS7_20,
  LS7_19,
  LS7_18,
  LS7_17,
  LS7_16,
  LS7_15,
  LS7_14,
  LS7_13
]);
print('LS8export: ', LS8export);

//Map.addLayer(LS7_21,  {bands: ['B3', 'B2', 'B1'], min: 0, max: 0.3})


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
      'BLUE':   image.select('B1'),
      'GREEN':  image.select('B2'),
      'RED':    image.select('B3'),
      'NIR':    image.select('B4'),
      'SWIR1':  image.select('B5'),
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
var bands = ['Br4_3', 'Br6_2', 'Br7_3','BSI', 'NDVI','SCI' , 'NDBI', 'Br5_4_3']  //;  ['B2', 'B3', 'B4', 'B5', 'B6', 'B7','Br4_3', 'Br6_2', 'Br7_3', 'BSI', 'NDVI', 'SCI', 'SBL'] 
var LS8train = ee.ImageCollection.fromImages([LS7_21
  /*ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20211122'),
  ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20210903'),
  ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20210412'),
  ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20210701')*/
]);

var trainer = LS8train.map(process);
var trainerList = trainer.toList(trainer.size())

var training = ee.Image(trainerList.get(0)).select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
  collection: PPclasses21,
  properties: ['LC'],
  scale: 30
})
//print(training)

//Train the classifier
var classifier = ee.Classifier.smileCart().train(training, 'LC', bands);

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

var n = 5
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['B3', 'B2', 'B1'], min: 0, max: 0.3}, 'true color', true)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'infrared', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['Br4_3', 'Br6_2', 'Br7_3'], min: 0.4, max: 2.5, gamma: 1.3}, 'RGB band ratios', false)
print(ee.Image(ProcessList.get(n)))



Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['BSI'], min: -0.3, max: 0.2, palette: ['CEFFCA','41903B', '054000']}, 'BSI', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['NDVI'],  min: -0.25, max: 0.5, palette: ['FF0000', 'FFFB00', '0FFF00']}, 'NDVI', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['SCI'], min: -0.4, max: 0.25, palette: ['FDEAEA', 'FE0000']}, 'SCI', false)


Map.addLayer(ee.Image(ClassiList.get(n)),{min:0, max:6, palette:['FF4C33','3339FF', '63FF31','76767A','D870FF', 'FFFB70', '165F00']}, 'classified', true);

Map.addLayer(ee.Image(BackfillList.get(n)),{min:0, max:3, palette:['FF4C33']}, 'backfills', false);
