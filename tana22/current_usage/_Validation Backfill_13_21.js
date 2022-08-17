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

var Vbf13 = ee.FeatureCollection('projects/ee-cjoseph/assets/validation_data/validation13_join').filter(ee.Filter.lte('LC', 20))
var Vbf21 = ee.FeatureCollection('projects/ee-cjoseph/assets/validation_data/validation21_join').filter(ee.Filter.lte('LC', 20))

var tvDataResize = ee.FeatureCollection('projects/ee-cjoseph/assets/validation_data/RandomizedTrainingDataResize')
//merge Dupuy 2021 trainig data with training data for backfills in 2017
dupuy_classes17 = dupuy_classes17.filter(ee.Filter.lte('LC', 12))/*.merge(dupuy_classes17.filter(ee.Filter.rangeContains('LC', 3, 12)))*/.merge(backfill_poly17).merge(otherBS17).merge(roofs17)
print(dupuy_classes17, 'dupuy_classes17')
//print(Dupuy)

/*Map.addLayer(dupuy_classes17,{} ,'dupuy_classes17')
Map.addLayer(viable,{} ,'viable')
*/
var trainingData = /*dupuy_classes17*/ tvDataResize
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

var Landsat17 = cloudfreeImage.filterDate('2016-10-01', '2017-05-01').median()//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170620');//('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20170706')!!! LC08_159073_20170620<-- highCC

//______________________________________________________________________________________
//Load Images

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
//print(Process, 'processed');


var ProcessList = Process.toList(Process.size());
//print(ProcessList, 'ProcessList')

//_____________________________________________________________________________________________________________________
//CLASSIFICATION
//Classification, train and classify

//Create training data
var bands = ['Br4_3', 'Br6_2', 'Br7_3','BSI', 'NDVI','SCI', 'NDWI', 'NDBI', 'Br5_4_3', 'elevation', 'slope', 'RI', 'CI', 'ARVI', 'Br5_7']  //;  ['B2', 'B3', 'B4', 'B5', 'B6', 'B7','Br4_3', 'Br6_2', 'Br7_4', 'BSI', 'NDVI', 'SCI', 'SBL'] 
var LS8train = ee.ImageCollection.fromImages([
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
//print(Classi,'classified')

var ClassiList = Classi.toList(Classi.size())

//!!! CONFUSION MATRIX VALIDATION
// Get a confusion matrix representing resubstitution accuracy.
var trainAccuracy = classifier.confusionMatrix();
print('Resubstitution error matrix: ', trainAccuracy);
print('Training overall accuracy: ', trainAccuracy.accuracy());
//print('kappa: ', trainAccuracy.kappa());
//print('producers Accuracy: ', trainAccuracy.producersAccuracy());
//print('consumers Accuracy: ', trainAccuracy.consumersAccuracy());


//__________________________________________________________________
//known backfill area validation 2021
//Image from the data aquisition year
var Landsat21 = cloudfreeImage.filterDate('2020-10-01', '2021-05-01').median().set('system:id', '2021')

var img21 = process(Landsat21)
var bfvali21 = img21.select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
  collection: Vbf21,
  properties: [trainingCol],
  scale: 30
})
//_____Random Forest: validation with each of the five folds excluded once from training
  //fold 1 classification validation
  var vclassifier = ee.Classifier.smileRandomForest({numberOfTrees: NumberOfTrees, seed: seedRF})
      .train({
        features: training,
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

function to20(element){element = element.set('LC', 20); return element}

var simpleother = otherBS17.map(to20)
//print(simpleother, 'simpleother')
var simpleroof = roofs17.map(to20)
//print(simpleroof, 'simpleroof')

var Vbf17 = ee.FeatureCollection([backfill_poly17, simpleother, simpleroof]).flatten()
//print(Vbf17, 'vbf17')
var Landsat17 = cloudfreeImage.filterDate('2016-10-01', '2017-05-01').median().set('system:id', '2017')

var img17 = process(Landsat17)
var bfvali17 = img17.select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
  collection: Vbf17,
  properties: [trainingCol],
  scale: 30
})

//random forest
var vclassifier = ee.Classifier.smileRandomForest({numberOfTrees: NumberOfTrees, seed: seedRF})
      .train({
        features: training,
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
//Image from the data aquisition year
var Landsat13 = cloudfreeImage.filterDate('2013-10-01', '2014-05-01').median().set('system:id', '2013')

var img13 = process(Landsat13)
var bfvali13 = img13.select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
  collection: Vbf13,
  properties: [trainingCol],
  scale: 30
})
//_____Random Forest: validation with each of the five folds excluded once from training
  //fold 1 classification validation
  var vclassifier = ee.Classifier.smileRandomForest({numberOfTrees: NumberOfTrees, seed: seedRF})
      .train({
        features: training,
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
                      