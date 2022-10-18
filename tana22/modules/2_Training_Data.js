//path to modules
var collection = require('users/cjoseph/tana22:modules/1_Image_Collection_Processing.js');

//import model elements
var ProcessList = collection.ProcessList
var Process = collection.Process
var LS8export = collection.LS8export
var viablegeo = collection.viablegeo
var GT = collection.GT
var Landsat17Collection = collection.Landsat17Collection
var Landsat17 = collection.Landsat17
var process = collection.process

//load assets
var dupuy_classes17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/dupuy_classes17');
var backfill_poly17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Bruno_R_17/backfill_poly17_Bruno');
var otherBS17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Bruno_R_17/otherBS17_Bruno');
var roofs17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Bruno_R_17/roofs17');

//merge Dupuy 2017 trainig data with training data for backfills in 2017
dupuy_classes17 = dupuy_classes17.filter(ee.Filter.lte('LC', 12))/*.merge(dupuy_classes17.filter(ee.Filter.rangeContains('LC', 3, 12)))*/.merge(backfill_poly17).merge(otherBS17).merge(roofs17)
//print(dupuy_classes17, 'dupuy_classes17')

//Definitions
var trainingVector = dupuy_classes17
var trainingCol = 'LC'

//___________________________________________________________________
//Create training data
var bands = ['B2', 'B3', 'B4','Br4_3', 'Br6_2', 'Br7_3','BSI', 'NDVI','SCI', 'NDWI', 'NDBI', 'Br5_4_3', 'elevation', 'slope', 'RI', 'CI', 'ARVI', 'Br5_7']  //;  ['B2', 'B3', 'B4', 'B5', 'B6', 'B7','Br4_3', 'Br6_2', 'Br7_4', 'BSI', 'NDVI', 'SCI', 'SBL'] 

//1 train with a single median image
  //1.1 all training points
var LS8train =  ee.ImageCollection.fromImages([ //Landsat17m
  Landsat17,
]);

var trainer = LS8train.map(process);
var trainerList = trainer.toList(trainer.size())
//Map.addLayer(ee.Image(trainer.first()), {},'tisisit')

var training = ee.Image(trainerList.get(0)).select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
  collection: trainingVector,
  properties: [trainingCol],
  scale: 30,
  geometries: true
})

var tvdata = training.randomColumn('random', 1, 'uniform')
//print(training, 'training')

//________________________________________________________
  //1.2 Downsampled training dataset to render the class distribution less skewet towards rice
    
    //List with all landcover indices to map function over
var LClist = ee.List.sequence(0, 13, 1)
    //margin = number of backfil training points used for downsampling other classes
var margin = training.filter(ee.Filter.eq('LC', 0)).size()
    //define dataset to downsample
var toDownSample = training
    //downsampling function
function DownSample(num){
    //filter the whole dataset for the respective landcover class and add a random column from 0 to 1
  var filt = toDownSample.filter(ee.Filter.eq('LC', num)).randomColumn({columnName:'randomLarge', 
                                                                    seed: 2, 
                                                                    distribution: 'uniform'})
    //get number of  points of the class
  var filtSize = filt.size()
    //downsize class if it contains more data values than defined by the margin
  var Dsample = filt.filter(ee.Filter.lte('randomLarge', margin.divide(filtSize)))
  
  return Dsample
}

var CollectionList = LClist.map(DownSample)
print(CollectionList.get(1),'CollectionList')

var tvDataResizeBF = ee.FeatureCollection(CollectionList).flatten().randomColumn('random', 1, 'uniform');//somehow here, a line is added
//print(tvDataResizeBF.get(1), 'tvDataResizeBF')



/*//_______________________________________________________________________
//sampling over the whole training dataset (GT)
//create training data for the whole 2017 image (experiment)
var elevation = ee.Image('USGS/SRTMGL1_003').clip(GT).select('elevation');
var slope = ee.Terrain.slope(elevation)

function processGT(image){
  //clipping the image
  var image = image.clip(GT);
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
  var BSI = image.expression(//Bare Soil Index Diek et al. 2017
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
  var Br7_3 = image.expression(//Mwaniki et al. 2015 //change RED to Green
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


var trainerGT = LS8train.map(processGT);
var trainerListGT = trainerGT.toList(trainerGT.size())
//Map.addLayer(ee.Image(trainer.first()), {},'tisisit')

var trainingGT = ee.Image(trainerListGT.get(0)).select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
  collection: trainingVector,
  properties: [trainingCol],
  scale: 30,
  geometries: true
})

var tvdataGT = trainingGT.randomColumn('random', 1, 'uniform')
//print(training, 'training')
//______________
//dowmsampling the dataset GT
  //1.2 Downsampled training dataset to render the class distribution less skewet towards rice
    
    //List with all landcover indices to map function over
var LClist = ee.List.sequence(0, 13, 1)
    //margin = number of backfil training points used for downsampling other classes
var marginGT = trainingGT.filter(ee.Filter.eq('LC', 0)).size()
print(marginGT, 'marginGT')

    //define dataset to downsample
var toDownSampleGT = trainingGT

    //downsampling function
function DownSampleGT(num){
    //filter the whole dataset for the respective landcover class and add a random column from 0 to 1
  var filt = toDownSampleGT.filter(ee.Filter.eq('LC', num)).randomColumn({columnName:'randomLarge', 
                                                                    seed: 2, 
                                                                    distribution: 'uniform'})
    //get number of  points of the class
  var filtSize = filt.size()
    //downsize class if it contains more data values than defined by the margin
  var Dsample = filt.filter(ee.Filter.lte('randomLarge', marginGT.divide(filtSize)))
  
  return Dsample
}

var CollectionListGT = LClist.map(DownSampleGT)
print(CollectionListGT.get(7),'CollectionList')

var tvDataResizeBF_GT = ee.FeatureCollection(CollectionListGT).flatten().randomColumn('random', 1, 'uniform');
print(tvDataResizeBF_GT.size(), 'tvDataResizeBF_GT')


//___________________________________________________________________
//2 train with three images
var LS8train = Landsat17Collection
print(LS8train, 'LS8train')

var trainer = LS8train.map(process);
//var trainerList = trainer.toList(trainer.size())
//print(trainerList, 'trainerList')

var featList = trainer.map(function sampling(x){
    var feat = ee.Image(x).select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
      collection: trainingVector,
      properties: [trainingCol],
      scale: 30,
      geometries: true
    })
  return feat
})

print(featList, 'featList')

var training_allImg17_intermediate = featList.flatten()

var training_allImg17 = training_allImg17_intermediate.randomColumn('random', 1, 'uniform');

var margin = training_allImg17.filter(ee.Filter.eq('LC', 0)).size()
print(margin, 'margin3img')
var toDownSample = training_allImg17_intermediate

var CollectionList2 = LClist.map(DownSample)
print(CollectionList2.get(0),'CollectionList2')

var training_allImg17ResizeBF = ee.FeatureCollection(CollectionList2).flatten().randomColumn('random', 1, 'uniform');*/
//____________________________________________
//Exports
//1 to Asset
/*Export.table.toAsset({
  collection: training_allImg17,
  description: 'alltraining_allImg17'
})

Export.table.toAsset({
  collection: training_allImg17ResizeBF,
  description: 'alltraining_allImg17ResizeBF'
})*/

Export.table.toAsset({
  collection: tvdata,
  description: 'allTrainingData', 
  //folder: 'GEE', 
  //fileFormat: 'SHP', 
  //selectors: ['LC', 'random'] 
})

Export.table.toAsset({
  collection: tvDataResizeBF,
  description: 'RandomizedTrainingDataResizeBF', 
  //folder: 'GEE', 
  //fileFormat: 'SHP', 
  //selectors: ['LC', 'random', 'randomLarge'] 
})
/*
Export.table.toAsset({
  collection: tvdataGT,
  description: 'allTraningData_GT',
})

Export.table.toAsset({
  collection: tvDataResizeBF_GT,
  description: 'RandomizedTrainingDataResizeBF_GT'
})*/
//2 to Drive
//Export training Data to investigate distribution
/*Export.table.toDrive({
  collection: tvdataGT,
  description: 'allTraningData_GT',
  folder: 'GEEData', 
  fileFormat: 'CSV', 
  selectors: ['LC', 'random'] 
  })
  
Export.table.toDrive({
  collection: tvDataResizeBF_GT,
  description: 'RandomizedTrainingDataResizeBF_GT',
  folder: 'GEEData',
  fileFormat: 'CSV',
  selectors: ['LC', 'random', 'randomLarge'] 
})*/
  
Export.table.toDrive({
  collection: tvdata,
  description: 'allTrainingData', 
  folder: 'GEEData', 
  fileFormat: 'CSV', 
  selectors: ['LC', 'random'] 
})


//var tvDataResizeBF = ee.FeatureCollection('projects/ee-cjoseph/assets/validation_data/RandomizedTrainingDataResizeBF')
Export.table.toDrive({
  collection: tvDataResizeBF,
  description: 'RandomizedTrainingDataResizeBF', 
  folder: 'GEEData', 
  fileFormat: 'CSV', 
  selectors: ['LC', 'random', 'randomLarge'] 
}) 

print(CollectionList, 'list')
print(tvdata.filter(ee.Filter.eq('LC', 1)).size(),'tvdata')
print(tvDataResizeBF.filter(ee.Filter.eq('LC', 1)).size(), 'resize')
print(training.filter(ee.Filter.eq('LC', 1)).size(),'training')