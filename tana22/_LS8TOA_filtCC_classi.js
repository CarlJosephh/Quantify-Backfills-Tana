/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[47.553643801217476, -18.849828661297334],
          [47.475022890572944, -18.85015357086914],
          [47.469529726510444, -18.93818085071176],
          [47.57046661615888, -18.945000218929376]]]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
//load boundary layers

var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana')
var viable = ee.FeatureCollection('projects/ee-cjoseph/assets/viable_areas')
var classes = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/classes')
var classes_poly = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/classes_poly');


//____________________________________________________________
//filter the dataset for images with low CloudCover over ROI
  //load dataset
var dataset = ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
    .filterBounds(GT)
    .filter(ee.Filter.calendarRange(2013, 2021, 'year'))//2013 - 2021
    //.filter(ee.Filter.lte('CLOUD_COVER', 5));
    
print(dataset)

  //filter dataset for low cloudcover over Tana viable areas
function ROICC (image) {//###FUNCTION SEEMS TO ONLY WORK FOR TOA IMAGES
  var cloud = ee.Algorithms.Landsat.simpleCloudScore(image).select('cloud');//'cloud'
  var cloudiness = cloud.reduceRegion({
    reducer: 'mean', 
    geometry: GT, 
    scale: 30,
  });
  return image.set(cloudiness);
}


var withCloudiness = dataset.map(ROICC)

    //adjust boundary value for CC filtering
var filteredCollection = withCloudiness.filter(ee.Filter.lte('cloud', 2));//'cloud'
print(filteredCollection, 'fC');



    //load all images of the filtered collection for visual inspection (disable after done)
/*function addImageTOA(image) { // display each image in collection
  var id = image.id
  var image = ee.Image(image.id)
  Map.addLayer(image, {bands: ['B4', 'B3', 'B2'], min: 0.0, max: 0.4, gamma: 1.3},id.slice(-8))//get('DATE_ACQUIRED')
}

filteredCollection.evaluate(function(filteredCollection) {  // use map on client-side
  filteredCollection.features.map(addImageTOA)
});
Map.addLayer(viable)
ttt = f.image()*/
//_______________________________________
//cloudmask all images in the cllection
  //cloudmask function
/*function maskL8sr(image) {
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


// Map the function over  data.
var masked = filteredCollection.map(maskL8sr);
print(masked) */

/*function addImageTOA(image) { // display each image in collection
  var id = image.id
  var image = ee.Image(image.id)
  Map.addLayer(image, {bands: ['B4', 'B3', 'B2'], min: 0.0, max: 0.4, gamma: 1.3},id.slice(-8))//get('DATE_ACQUIRED')
}

masked.evaluate(function(masked) {  // use map on client-side
  masked.features.map(addImageTOA)
})*/

//_______________________________________________________________
//Band calculations
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
  var NDBI = image.expression(//Normalized Difference Built up Index :Zha, Y., J. Gao, and S. Ni. "Use of Normalized Difference Built-Up Index in Automatically Mapping Urban Areas from TM Imagery." International Journal of Remote Sensing 24, no. 3 (2003): 583-594
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
  var newBands = ee.Image([BSI, NDVI, SCI, SBL, NDBI, NDWI, Br4_3, Br6_2, Br7_3, Br5_4_3]);
  image = image.addBands(newBands);  
  return image;
}

//execute function on image collection
var Process = filteredCollection.map(process);
print(Process, 'processed');
var ProcessList = Process.toList(Process.size())
//_____________________________________________________________________________________________________________________
//CLASSIFICATION
//Classification, train and classify

//Create training data
var bands = ['Br4_3', 'Br6_2', 'Br7_3', 'BSI', 'NDVI','NDBI', 'NDWI', 'SCI','Br5_4_3']  //;  ['B2', 'B3', 'B4', 'B5', 'B6', 'B7','Br4_3','NDWI', 'Br6_2', 'Br7_3', 'BSI', 'NDVI','NDBI', 'SCI', 'SBL', 'Br5_4_3'] 
//var collMean = Process.filter(ee.Filter.calendarRange(2021, 2021, 'year'))//.median()
//print(collMean, 'collMean')

//Training Data
// QA_PIXEL band (CFMask) to mask unwanted pixels.

function maskL8sr(image) {
  // Bit 0 - Fill
  // Bit 1 - Dilated Cloud
  // Bit 2 - Cirrus
  // Bit 3 - Cloud
  // Bit 4 - Cloud Shadow
  var qaMask = image.select('QA_PIXEL').bitwiseAnd(parseInt('11111', 2)).eq(0);
  var saturationMask = image.select('QA_RADSAT').eq(0);


  //apply the masks.
  return image
      .updateMask(qaMask)
      .updateMask(saturationMask);
}

// Map the function over one year of data.
var collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
                     .filter(ee.Filter.calendarRange(2021,2021,'year'))
                     .map(process)
                     .map(maskL8sr)
                     .filterBounds(GT);
print(collection, 'training images')
var composite = collection.median();

// Display the training image.
Map.addLayer(composite, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'training image');

var LS8train = ee.ImageCollection(
   //collMean.median() ]);*/
   
    collection.mean()
);

//var trainer = LS8train.map(process);
var trainerList = LS8train.toList(LS8train.size())

var training = ee.Image(trainerList.get(0)).select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
  collection: classes_poly,
  properties: ['landcover_code'],
  scale: 30
})
//print(training)

//Train the classifier
var classifier = ee.Classifier.smileCart().train(training, 'landcover_code', bands);

//classification
function classify(image){
  image = image.select(bands).classify(classifier)
  return image;
} 

var Classi = Process.map(classify)
print(Classi,'classified')
var ClassiList = Classi.toList(Classi.size())
//Backfill Analyses

function filterBF(image){
  image = image.lt(1)
  .selfMask()
  .rename('backfill');
  return image
}

var Backfill = Classi.map(filterBF)
print(Backfill, 'backfill')

var BackfillList = Backfill.toList(Backfill.size())

/*var geom18 = classified18.reduceToVectors({scale: 30, geometry: viable, labelProperty: null , bestEffort: true})
    .geometry()*/
//___________________________________________________________________________________
//Map view

var n = 20
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['B4', 'B3', 'B2'], min: 5000, max: 15000, gamma: 1.3}, 'true color', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['B5', 'B4', 'B3'], min: 5000, max: 15000, gamma: 1.3}, 'infrared', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['Br4_3', 'Br6_2', 'Br7_3'], min: 0.4, max: 2.5, gamma: 1.3}, 'RGB band ratios', false)
print(ee.Image(ProcessList.get(n)))

var minMaxValues = ee.Image(ProcessList.get(n)).reduceRegion({reducer: ee.Reducer.minMax(), geometry: geometry
});
print('minMaxValues', minMaxValues)

Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['BSI'], min: -0.3, max: 0.2, palette: ['CEFFCA','41903B', '054000']}, 'BSI', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['NDVI'],  min: -0.25, max: 0.5, palette: ['FF0000', 'FFFB00', '0FFF00']}, 'NDVI', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['SCI'], min: -0.4, max: 0.25, palette: ['FDEAEA', 'FE0000']}, 'SCI', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['NDBI'], min: -0.85, max: 0.4, palette: ['4fff33','f9ff33','ff3333']}, 'NDBI', false)

Map.addLayer(ee.Image(ClassiList.get(n)),{min:0, max:3, palette:['FF4C33','3339FF','76767A','4CFF33']}, 'classified', true);
/*function addImageTOA(image) { // display each image in collection
  var id = image.id
  var image = ee.Image(image.id)
  Map.addLayer(image, {min:0, max:3, palette:['FF4C33','3339FF','76767A','4CFF33']})//, id.slice(-8))//get('DATE_ACQUIRED')
}

Classi.evaluate(function(Classi) {  // use map on client-side
  Classi.features.map(addImageTOA)
})
*/

Map.addLayer(ee.Image(BackfillList.get(n)),{min:0, max:3, palette:['FF4C33']}, 'backfills', false);
print(Backfill)

var x = Classi.sort('system:index').first(-1)
print(x.getString('system:index'), 'sysindx')

/*function addImageTOA(image) { // display each image in collection
  var si = image.getString('system:index')
  var image = ee.Image(image.getString('system:index'))
  Map.addLayer(image, {min:0, max:3, palette:['FF4C33']}, si.slice(-8))//get('DATE_ACQUIRED')
}

Backfill.evaluate(function(Backfill) {  // use map on client-side
  Backfill.features.map(addImageTOA)
})*/