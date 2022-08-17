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
var bands = ['Br4_3', 'Br6_2', 'Br7_3','BSI', 'NDVI','SCI', 'NDWI', 'NDBI', 'Br5_4_3', 'elevation', 'slope', 'RI', 'CI', 'ARVI', 'Br5_7']  //;  ['B2', 'B3', 'B4', 'B5', 'B6', 'B7','Br4_3', 'Br6_2', 'Br7_4', 'BSI', 'NDVI', 'SCI', 'SBL'] 

//1 train with a single median image
  //1.1 all training points
var LS8train =  ee.ImageCollection.fromImages([ //Landsat17m
  Landsat17,
]);

var trainer = LS8train.map(process);
var trainerList = trainer.toList(trainer.size())


var training = ee.Image(trainerList.get(0)).select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
  collection: trainingVector,
  properties: [trainingCol],
  scale: 30,
  geometries: true
})

var tvdata = training.randomColumn('random', 1, 'uniform')
//print(training, 'training')

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
print(CollectionList.get(7),'CollectionList')

var tvDataResizeBF = ee.FeatureCollection(CollectionList).flatten().randomColumn('random', 1, 'uniform');
//print(tvDataResizeBF, 'tvDataResizeBF')


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

var training_allImg17ResizeBF = ee.FeatureCollection(CollectionList2).flatten().randomColumn('random', 1, 'uniform');
//____________________________________________
//Exports
//1 to Asset
Export.table.toAsset({
  collection: training_allImg17,
  description: 'alltraining_allImg17'
})

Export.table.toAsset({
  collection: training_allImg17ResizeBF,
  description: 'alltraining_allImg17ResizeBF'
})

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

//2 to Drive
//Export training Data to investigate distribution

Export.table.toDrive({
  collection: tvdata,
  description: 'allTrainingData', 
  folder: 'GEE', 
  fileFormat: 'CSV', 
  selectors: ['LC', 'random'] 
})


var tvDataResizeBF = ee.FeatureCollection('projects/ee-cjoseph/assets/validation_data/RandomizedTrainingDataResizeBF')
Export.table.toDrive({
  collection: tvDataResizeBF,
  description: 'RandomizedTrainingDataResizeBF', 
  folder: 'GEEData', 
  fileFormat: 'CSV', 
  selectors: ['LC', 'random', 'randomLarge'] 
}) 