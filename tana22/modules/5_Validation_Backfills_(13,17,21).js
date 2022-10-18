//path to models
var collection = require('users/cjoseph/tana22:modules/1_Image_Collection_Processing.js')
var ImageClassification = require('users/cjoseph/tana22:modules/3_Classification_BFArea.js');

//import model elements
var NumberOfTrees = ImageClassification.NumberOfTrees
var seedRF = ImageClassification.seedRF
var bands = ImageClassification.bands
var trainingCol = ImageClassification.trainingCol
var Landsat13 = collection.Landsat13
var Landsat17 = collection.Landsat17
var Landsat21 = collection.Landsat21
var Process = collection.process
var TD_as_classi = ImageClassification.trainingData

//load training datasets (already sampled)
var medianTDResizeBF = ee.FeatureCollection('projects/ee-cjoseph/assets/Training_Datasets_sampled/RandomizedTrainingDataResizeBF')
var MedianTD = ee.FeatureCollection('projects/ee-cjoseph/assets/Training_Datasets_sampled/allTrainingData')
var allimg17 = ee.FeatureCollection('projects/ee-cjoseph/assets/Training_Datasets_sampled/alltraining_allImg17')
var allimg17ResizeBF = ee.FeatureCollection('projects/ee-cjoseph/assets/Training_Datasets_sampled/training_allImg17ResizeBF')

var tvDataResize = ee.FeatureCollection('projects/ee-cjoseph/assets/validation_data/RandomizedTrainingDataResizeBF')
print(tvDataResize.size(), 'tvDataResize')
print(medianTDResizeBF.size(), 'medianTDResizeBF')

//load backfill validation datasets
var backfill_poly17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Bruno_R_17/backfill_poly17_Bruno');
var otherBS17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Bruno_R_17/otherBS17_Bruno');
var roofs17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Bruno_R_17/roofs17');

var Vbf13 = ee.FeatureCollection('projects/ee-cjoseph/assets/validation_data/validation13_join').filter(ee.Filter.lte('LC', 20))
var Vbf21 = ee.FeatureCollection('projects/ee-cjoseph/assets/validation_data/validation21_join').filter(ee.Filter.lte('LC', 20))


//define training dataset to be used
var DataUsed = TD_as_classi

//________________________________________________________
//known backfill area validation 2021
//Run the band calculation function on the composite Image from the data aquisition year
var img21 = Process(Landsat21)

var bfvali21 = img21.select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
  collection: Vbf21,
  properties: [trainingCol],
  scale: 30
})
//_____Random Forest: validation with each of the five folds excluded once from training
  //fold 1 classification validation
  var vclassifier = ee.Classifier.smileRandomForest({numberOfTrees: NumberOfTrees, seed: seedRF})
      .train({
        features: DataUsed,
        classProperty: trainingCol,
        inputProperties: bands
      });

  var bf21 = bfvali21.classify(vclassifier)

var BF21falseneg = bf21.filter(ee.Filter.eq('LC', 0)).filter(ee.Filter.gte('classification', 1))
.map(function year(element){ element = element.set('year', 2021); return element});//falsly classified as no backfill
//print(BF21falseneg, 'BF21falseneg')


var BF21falsepos = bf21.filter(ee.Filter.eq('LC', 20)).filter(ee.Filter.eq('classification', 0))
  .map(function year(element){ element = element.set('year', 2021); return element});//falsly classified as backfill
//print(BF21falsepos, 'BF21falsepos')

  var testAccuracy21 = bf21.errorMatrix('LC', 'classification');
  print('Validation error matrix BF21: ', testAccuracy21);
  print('producers Accuracy BF21: ', testAccuracy21.producersAccuracy());
  print('consacc', testAccuracy21.consumersAccuracy())
  //print('Validation overall accuracy F1: ', testAccuracy.accuracy());  //print('Validation overall accuracy F1: ', testAccuracy.accuracy());
  
var list = testAccuracy21.array().toList()
var bfright = ee.Number(ee.List(list.get(0)).get(0))
print(bfright)
var bfwrong = ee.Number(ee.List(list.get(0)).splice(0,1).reduce(ee.Reducer.sum()))
print(bfwrong)
var notbfRight = ee.Number(ee.List(list.get(20)).splice(0,1).reduce(ee.Reducer.sum()))
print(notbfRight)
var notbfWrong = ee.Number(ee.List(list.get(20)).get(0))
print(notbfWrong)

var ma21 = ee.Array([[bfright, bfwrong],
                   [notbfWrong, notbfRight]])

var bfoverallaccuracy21 = bfright.add(notbfRight).divide(bfright.add(notbfRight).add(bfwrong).add(notbfWrong))
print(bfoverallaccuracy21, 'bfoverallaccuracy21')

//_______________________________________________________________________
//known backfill area validation 2017
//Run the band calculation function on the composite Image from the data aquisition year
var img17 = Process(Landsat17)

function to20(element){element = element.set('LC', 20); return element}

var simpleother = otherBS17.map(to20)
//print(simpleother, 'simpleother')
var simpleroof = roofs17.map(to20)
//print(simpleroof, 'simpleroof')

var Vbf17 = ee.FeatureCollection([backfill_poly17, simpleother, simpleroof]).flatten()
//print(Vbf17, 'vbf17')


var bfvali17 = img17.select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
  collection: Vbf17,
  properties: [trainingCol],
  scale: 30
})

//random forest
var vclassifier = ee.Classifier.smileRandomForest({numberOfTrees: NumberOfTrees, seed: seedRF})
      .train({
        features: DataUsed,
        classProperty: trainingCol,
        inputProperties: bands
      });

  var bf17 = bfvali17.classify(vclassifier)

var BF17falseneg = bf17.filter(ee.Filter.eq('LC', 0)).filter(ee.Filter.gte('classification', 1))
.map(function year(element){ element = element.set('year', 2017); return element});//falsly classified as no backfill


var BF17falsepos = bf17.filter(ee.Filter.eq('LC', 20)).filter(ee.Filter.eq('classification', 0))
  .map(function year(element){ element = element.set('year', 2017); return element});//falsly classified as backfill

  var testAccuracy17 = bf17.errorMatrix('LC', 'classification');
  print('Validation error matrix BF17: ', testAccuracy17);
  print('producers Accuracy BF17: ', testAccuracy17.producersAccuracy());
  //print('Validation overall accuracy F1: ', testAccuracy.accuracy());  //print('Validation overall accuracy F1: ', testAccuracy.accuracy());
  
var list = testAccuracy17.array().toList()
var bfright = ee.Number(ee.List(list.get(0)).get(0))
print(bfright)
var bfwrong = ee.Number(ee.List(list.get(0)).splice(0,1).reduce(ee.Reducer.sum()))
print(bfwrong)
var notbfRight = ee.Number(ee.List(list.get(20)).splice(0,1).reduce(ee.Reducer.sum()))
print(notbfRight)
var notbfWrong = ee.Number(ee.List(list.get(20)).get(0))
print(notbfWrong)

var bfoverallaccuracy17 = bfright.add(notbfRight).divide(bfright.add(notbfRight).add(bfwrong).add(notbfWrong))
print(bfoverallaccuracy17, 'bfoverallaccuracy17')

var ma17 = ee.Array([[bfright, bfwrong],
                   [notbfWrong, notbfRight]])
                   
//_______________________________________________________________________
//known backfill area validation 2013
//Run the band calculation function on the composite Image from the data aquisition year
var img13 = Process(Landsat13)

var bfvali13 = img13.select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
  collection: Vbf13,
  properties: [trainingCol],
  scale: 30
})
//_____Random Forest: validation with each of the five folds excluded once from training
  //fold 1 classification validation
  var vclassifier = ee.Classifier.smileRandomForest({numberOfTrees: NumberOfTrees, seed: seedRF})
      .train({
        features: DataUsed,
        classProperty: trainingCol,
        inputProperties: bands
      });

  var bf13 = bfvali13.classify(vclassifier)

var BF13falseneg = bf13.filter(ee.Filter.eq('LC', 0)).filter(ee.Filter.gte('classification', 1))
  .map(function year(element){ var element = element.set('year', 2013); return element});//falsly classified as no backfill
//print(BF13falseneg, 'BF13falseneg')


var BF13falsepos = bf13.filter(ee.Filter.eq('LC', 20)).filter(ee.Filter.eq('classification', 0))
  .map(function year(element){ var element = element.set('year', 2013); return element});//falsly classified as backfill
//print(BF13falsepos, 'BF13falsepos')

  var testAccuracy13 = bf13.errorMatrix('LC', 'classification');
  print('Validation error matrix BF13: ', testAccuracy13);
  print('producers Accuracy BF13: ', testAccuracy13.producersAccuracy());
  //print('Validation overall accuracy F1: ', testAccuracy.accuracy());  //print('Validation overall accuracy F1: ', testAccuracy.accuracy());
  
  
var list = testAccuracy13.array().toList()
var bfright = ee.Number(ee.List(list.get(0)).get(0))
print(bfright)
var bfwrong = ee.Number(ee.List(list.get(0)).splice(0,1).reduce(ee.Reducer.sum()))
print(bfwrong)
var notbfRight = ee.Number(ee.List(list.get(20)).splice(0,1).reduce(ee.Reducer.sum()))
print(notbfRight)
var notbfWrong = ee.Number(ee.List(list.get(20)).get(0))
print(notbfWrong)


var bfoverallaccuracy13 = (bfright.add(notbfRight)).divide(bfright.add(notbfRight).add(bfwrong).add(notbfWrong))
print(bfoverallaccuracy13, 'bfoverallaccuracy13')

var ma13 = ee.Array([[bfright, bfwrong],
                   [notbfWrong, notbfRight]])
                   
//____________________________________________________________________________________________
//merging and exporting
//merging and exporting the wrongly itentifyed backfill areas to display commonly confused with backfill
var falseclassi = ee.FeatureCollection([BF13falseneg, BF13falsepos, BF17falseneg, BF17falsepos, BF21falseneg, BF21falsepos]).flatten()
//print(falseclassi,'falseclassi')
Export.table.toDrive({collection: falseclassi, 
                      description: 'wrongClassiBF', 
                      folder: 'GEEData',
                      fileFormat: 'CSV',
                      selectors: ['LC', 'classification', 'year']})
                      
//exporting the backfill confusion matices
var BFerrmatr21 = ee.FeatureCollection([ee.Feature(null, {classiBF: ma21.get([0, 0]), classiNOT: ma21.get([0, 1])}),
                                        ee.Feature(null, {classiBF: ma21.get([1, 0]), classiNOT: ma21.get([1, 1])}),
                                        ee.Feature(null, {overallAccuracy: bfoverallaccuracy21})])
print(BFerrmatr21, 'BFerrmatr21')
Export.table.toDrive({collection: BFerrmatr21,
                      description: 'BFerror_matrix_2021',
                      folder: 'GEEData',
                      fileFormat: 'CSV',
                      selectors: ['classiBF', 'classiNOT', 'overallAccuracy']})
                      
var BFerrmatr17 = ee.FeatureCollection([ee.Feature(null, {classiBF: ma17.get([0, 0]), classiNOT: ma17.get([0, 1])}),
                                        ee.Feature(null, {classiBF: ma17.get([1, 0]), classiNOT: ma17.get([1, 1])}),
                                        ee.Feature(null, {overallAccuracy: bfoverallaccuracy17})])
print(BFerrmatr17, 'BFerrmatr17')
Export.table.toDrive({collection: BFerrmatr17,
                      description: 'BFerror_matrix_2017',
                      folder: 'GEEData',
                      fileFormat: 'CSV',
                      selectors: ['classiBF', 'classiNOT', 'overallAccuracy']})                     
                      
var BFerrmatr13 = ee.FeatureCollection([ee.Feature(null, {classiBF: ma13.get([0, 0]), classiNOT: ma13.get([0, 1])}),
                                        ee.Feature(null, {classiBF: ma13.get([1, 0]), classiNOT: ma13.get([1, 1])}),
                                        ee.Feature(null, {overallAccuracy: bfoverallaccuracy13})])
print(BFerrmatr13, 'BFerrmatr13')
Export.table.toDrive({collection: BFerrmatr13,
                      description: 'BFerror_matrix_2013',
                      folder: 'GEEData',
                      fileFormat: 'CSV',
                      selectors: ['classiBF', 'classiNOT', 'overallAccuracy']})                     
                      