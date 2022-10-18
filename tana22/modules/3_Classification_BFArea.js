//path to models
var collection = require('users/cjoseph/tana22:modules/1_Image_Collection_Processing.js');

//import model elements
var ProcessList = collection.ProcessList
var Process = collection.Process
var LS8export = collection.LS8export
var viablegeo = collection.viablegeo
var GT = collection.GT

//load assets
var dupuy_classes17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/dupuy_classes17');
var backfill_poly17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Bruno_R_17/backfill_poly17_Bruno');
var otherBS17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Bruno_R_17/otherBS17_Bruno');
var roofs17 = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/Bruno_R_17/roofs17');

//merge Dupuy 2017 trainig data with training data for backfills in 2017
dupuy_classes17 = dupuy_classes17.filter(ee.Filter.lte('LC', 12))/*.merge(dupuy_classes17.filter(ee.Filter.rangeContains('LC', 3, 12)))*/.merge(backfill_poly17).merge(otherBS17).merge(roofs17)
print(dupuy_classes17, 'dupuy_classes17')


//load training datasets (already sampled)
//var tvDataResize = ee.FeatureCollection('projects/ee-cjoseph/assets/validation_data/RandomizedTrainingDataResizeBF')
var medianTDResizeBF = ee.FeatureCollection('projects/ee-cjoseph/assets/Training_Datasets_sampled/RandomizedTrainingDataResizeBF')
var MedianTD = ee.FeatureCollection('projects/ee-cjoseph/assets/Training_Datasets_sampled/allTrainingData')
/*var allimg17 = ee.FeatureCollection('projects/ee-cjoseph/assets/Training_Datasets_sampled/alltraining_allImg17')
var allimg17ResizeBF = ee.FeatureCollection('projects/ee-cjoseph/assets/Training_Datasets_sampled/training_allImg17ResizeBF')
var medianTD_GT = ee.FeatureCollection('projects/ee-cjoseph/assets/Training_Datasets_sampled/allTraningData_GT')
var medianTDResizeBF_GT = ee.FeatureCollection('projects/ee-cjoseph/assets/Training_Datasets_sampled/RandomizedTrainingDataResizeBF_GT')*/

var trainingData = medianTDResizeBF// dupuy_classes17 medianTD_GT//
var trainingCol = 'LC'

var StartYear = 2013
var EndYear = 2022

var YearOfInterest = 2016

var NumberOfTrees = 100
var seedRF = 10


//_____________________________________________________________________________________________________________________
//CLASSIFICATION
//Classification, train and classify

//Create training data
var bands = ['Br4_3', 'Br6_2', 'Br7_3','BSI', 'NDVI', 'NDWI', 'NDBI', 'RI', 'CI', 'ARVI', 'Br5_7', 'elevation', 'slope']  //; 15.08. ['Br4_3', 'Br6_2', 'Br7_3','BSI', 'NDVI','SCI', 'NDWI', 'NDBI', 'Br5_4_3', 'elevation', 'slope', 'RI', 'CI', 'ARVI', 'Br5_7'] 
/*var LS8train =   ee.ImageCollection.fromImages([
  Landsat17,
]);

var trainer = LS8train.map(process);

var trainerList = trainer.toList(trainer.size())

var training = ee.Image(trainerList.get(0)).select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
  collection: trainingData,
  properties: [trainingCol],
  scale: 30
})*/

//train with three images
//________________________
/*var LS8train = cloudfreeImage.filterDate('2016-10-01', '2017-05-01')
print(LS8train, 'LS8train')

var trainer = LS8train.map(process);
//var trainerList = trainer.toList(trainer.size())
//print(trainerList, 'trainerList')

var featList = trainer.map(function sampling(x){
    var feat = ee.Image(x).select(bands).sampleRegions({//ee.Image(ProcessList.get(0))
      collection: trainingData,
      properties: [trainingCol],
      scale: 30,
      geometries: true
    })
  return feat
})

print(featList, 'featList')

var training = featList.flatten()*/
//___________________________

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
      features: trainingData, //training, //when using resampled training data directly copy to here
      classProperty: trainingCol,
      inputProperties: bands,
      /*subsamplingSeed: 1*/
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
Export.image.toAsset({image: ee.Image(ClassiList.get(5)), 
                      description: 'classi_img_2017', 
                      region: viablegeo, 
                      scale: 30,
                      pyramidingPolicy: 'sample'
})
//!!! CONFUSION MATRIX VALIDATION
// Get a confusion matrix representing resubstitution accuracy.
var trainAccuracy = classifier.confusionMatrix();
print('Resubstitution error matrix: ', trainAccuracy);
print('Training overall accuracy: ', trainAccuracy.accuracy());
print('kappa: ', trainAccuracy.kappa());
print('producers Accuracy: ', trainAccuracy.producersAccuracy());
print('consumers Accuracy: ', trainAccuracy.consumersAccuracy());

//____________________________________________________________________________________  
//Backfill Areas
//filter the classified image for BF areas
function filterBF(image){
  var id = image.get('system:id')
  var imageB = image.eq(0)
  .selfMask()
  .rename('backfill')
  .set('system:id', id);
  return imageB
}

var Backfill = Classi.map(filterBF)
print(Backfill, 'backfill')

//create a list of backfilled areas
var BackfillList = Backfill.toList(Backfill.size())
//_________________________________________________________________________________
// Area Calculation
//function to mask Backfills every year with the year before
function BFincrement(image){
  var id = image.get('system:id')
  var yrsBefore = Backfill.filter(ee.Filter.lt('system:id', id)).mosaic()
  var mask = yrsBefore.mask(image)
  mask = mask.not()
  var masked = image.updateMask(mask)
  var incr = masked.set('system:id', id)
  
  return incr
}
//run masking function for all years but the first (no increment possible)
//and sort by system id/ Year
var maskRast = Backfill.filter(ee.Filter.gt('system:id', ee.Number(StartYear).format())).map(BFincrement).sort('system:id')
print(maskRast, 'maskRast')
var BFincrList = maskRast.toList(maskRast.size())
//convert to list of images
var toreduce = maskRast.toList(maskRast.size());
//_ _ _ _ _ _ _ _ _ _ _ _ _
//alternative area calculation. is it more consistent?
/*var pixelCountareas = toreduce.map(function cntPxl(image){var redI = ee.Image(image).reduceRegion({reducer: ee.Reducer.sum(), scale:30, geometry: viablegeo})
                                                          var count = redI.getNumber('backfill').multiply(900)
                                                          return count
})

print(pixelCountareas, 'pixelCountareas')
var pixelCountareasIncrKm = ee.Array(pixelCountareas).multiply(0.000001)*/
//_ _ _ _ _  _ _ _ _ _ _ _ 
//even another way to calculate area using raster function
var bandArea = toreduce.map(function SingleClass(image){
  var areaImage = ee.Image(image).multiply(ee.Image.pixelArea())
  var area = areaImage.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: viablegeo,
    scale: 30
  })
  var bfAreaKm2 = ee.Number(
    area.get('backfill'))//.divide(1e6)
  return(bfAreaKm2)
})
print(bandArea, 'bandArea')
//-----------------------------
//function to convert yearly bf increase to vector and calculate the area in m2 //!!!why do the calculated values vary between different runs???
/*function area(image){
  var geom = ee.Image(image).reduceToVectors({reducer: ee.Reducer.countEvery(),
                                              geometryType: 'polygon',
                                              //crs: ee.Image(image).projection(),
                                              scale: 30, 
                                              geometry: viablegeo, 
                                              labelProperty: null , 
                                              bestEffort: true, //If the polygon would contain too many pixels at the given scale, compute and use a larger scale which would allow the operation to succeed.
                                              eightConnected:true, //If true, diagonally-connected pixels are considered adjacent; otherwise only pixels that share an edge are
                                              geometryInNativeProjection: true //Create geometries in the pixel projection, rather than WGS84.
  })
   .geometry()
   .area({maxError: 1})
   
   return geom
}
//run area calculation function and reverse the order ofthe list
var areaIncrM = toreduce.map(area)
print(areaIncrM, 'areaIncr')*/

/*Map.addLayer(ee.Image(toreduce.get(1)),{min:0, max:1, palette:['FF4C33']}, 'backfills')
Map.addLayer(ee.Image(toreduce.get(1)).reduceToVectors({reducer: ee.Reducer.countEvery(),
                                              geometryType: 'polygon',
                                              //crs: ee.Image(image).projection(),
                                              scale: 20, 
                                              geometry: viable, 
                                              labelProperty: null , 
                                              bestEffort: true, //If the polygon would contain too many pixels at the given scale, compute and use a larger scale which would allow the operation to succeed.
                                              eightConnected:true, //If true, diagonally-connected pixels are considered adjacent; otherwise only pixels that share an edge are
                                              geometryInNativeProjection: true //Create geometries in the pixel projection, rather than WGS84.
  })
   .geometry(),{}, 'poly')*/

//create an array from area values and convert tm2 to km2
var areaIncrKm = ee.Array(bandArea).multiply(0.000001)//areaIncrM

//create yearly steps for the year before, since backfill takes place in the dry season before the rainy season, which the image is taken from (e.g. RS 2014 image shows backfills during 2013)
var years = ee.List.sequence(StartYear+1, EndYear, 1);  // // [0,2,4,6,8,10]
var chart = ui.Chart.array.values({array: areaIncrKm, axis: 0 , xLabels: years })
                .setOptions({
                  title: 'Yearly increase of backfill area',
                  colors: ['1d6b99'],
                  pointSize: 10,
                  hAxis: {
                    'title': 'Year',
                    titleTextStyle: {italic: false, bold: true},
                    viewWindow: {min: 2014, max: 2022},
                    gridlines: {count: 9}
                  },
                  vAxis: {
                    'title': 'backfill area increase [km2]',
                    titleTextStyle: {italic: false, bold: true}
                  }
                });
print(chart,'Rate of backfill are increase')


//___________________________________________________________________________________________________________________
//Export Backfill area increment
  //create export CSV of area increment during year
var areaIncrKmexport = ee.FeatureCollection(areaIncrKm.toList()/*areaIncrKmexport.toList()*/
                        .map(function (element){ 
                        
                        var elementyear = ee.List.sequence(StartYear+1, EndYear, 1).get(areaIncrKm.toList().indexOf(element))
                        
                        return ee.Feature(null, {BFincr: element, year: elementyear})
                        }))

print(areaIncrKmexport, 'areaIncrKmexport')
Export.table.toDrive({
  collection: areaIncrKmexport,
  folder: 'GEEData',
  description:'YearlyIncrementKm2',
  fileFormat: 'CSV',
  selectors: ['BFincr', 'year']
});


  //Export increment Layers as feature collection SHP
function vektor(image){
  var id = image.get('system:id')
  
  var reg = image.reduceToVectors({ scale: 30, 
                                    geometry: viablegeo, 
                                    labelProperty: 'backfill' , 
                                    bestEffort: true,
                                    eightConnected:true,
                                    geometryInNativeProjection: true
  })
  .geometry()
  
  var vct = ee.Feature/*Collection*/(reg, {name: id})
  
  return vct
}

/*var incr2022 = vektor(maskRast.filter(ee.Filter.eq('system:id', '2022')).first())
print(incr2022)*/

var yrincC = maskRast.map(vektor)
//var yrincC = yrincC.mapflatten()
print(yrincC, 'yrincC')

// Export a subset of collection properties: three bands and the geometry
// as SHP.
Export.table.toDrive({
  collection: yrincC,
  description: 'yearlyincrementSHP',
  folder: 'GEE',
  fileFormat: 'SHP'
});

var projection = maskRast.first().select('backfill').projection().getInfo()
print(projection, 'maskRast')

/*var ArRast = maskRast.map(function fastarea(image){
  var id = image.get('system:id')
  var arI = image.multiply(ee.Image.pixelArea())
  return(arI).set('system:id', id)
})
print(ArRast, 'arearaster')*/
//___________________________________________________________________________________
//module exports
exports.StartYear = StartYear
exports.EndYear = EndYear
exports.NumberOfTrees = NumberOfTrees
exports.seedRF = seedRF
exports.trainingCol = trainingCol
exports.bands = bands
exports.trainingData = trainingData
exports.ClassiList = ClassiList
exports.Classi = Classi
exports.maskRast = maskRast


//Map view
Map.centerObject(GT,12)
//8 - 2022; 4 - 2018; 9 - 2013
var n = ee.Number(EndYear).subtract(YearOfInterest)//5 - 2017
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['B4', 'B3', 'B2'],  min: 0, max: 0.3}, 'true color', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['B5', 'B4', 'B3'],  min: 0, max: 0.3}, 'infrared', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['Br4_3', 'Br6_2', 'Br7_3'], min: 0.4, max: 2.5, gamma: 1.3}, 'RGB band ratios', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['Br5_7'], min: 0.4, max: 19.7, palette: ['1171F3','F1E608', 'F13D08']}, 'NIR / SWIR', false)
Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['RI'], min: 0.3, max: 3.6, palette: ['1171F3','F1E608', 'F13D08']}, 'RI', false)
//print(ee.Image(ProcessList.get(n)))

var minMaxValues = ee.Image(ProcessList.get(n)).select(['Br5_7', 'BSI', 'RI']).reduceRegion({reducer: ee.Reducer.minMax(), geometry: viablegeo, scale: 30});
print('minMaxValues', minMaxValues)

Map.addLayer(ee.Image(ProcessList.get(n)), {bands: ['BSI'], min: -0.7, max: 0.4, palette: ['1171F3','F1E608', 'F13D08']}, 'BSI', false)
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
                                                                  
/*Map.addLayer(ee.Image(ClassiList.get(5)),{min:0, max:13, palette:['FF4C33',    //backfill
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
                                                                  ]}, 'classified', false);*/

Map.addLayer(ee.Image(BackfillList.get(n)),{min:0, max:1, palette:['FF4C33']}, 'backfills', false);
//(image, description, assetId, pyramidingPolicy, dimensions, region, scale, crs, crsTransform, maxPixels, shardSize
//print(ee.Image(BackfillList.get(8)))
Map.addLayer(ee.Image(BFincrList.get(ee.Number(8).subtract(n))),{min:0, max:1, palette:['FF4C33']}, 'backfill increase', false);

Export.image.toDrive({image: ee.Image(ClassiList.get(5)).unmask(-999), folder: 'GEE', region: viablegeo, description: 'classifiedimg2017', scale: 30, skipEmptyTiles: true, fileFormat: 'GeoTIFF' })
Export.image.toDrive({image: ee.Image(ClassiList.get(1)).unmask(-999), folder: 'GEE', region: viablegeo, description: 'classifiedimg2021', scale: 30, skipEmptyTiles: true, fileFormat: 'GeoTIFF' })
Export.image.toDrive({image: ee.Image(ClassiList.get(9)).unmask(-999), folder: 'GEE', region: viablegeo, description: 'classifiedimg2013', scale: 30, skipEmptyTiles: true, fileFormat: 'GeoTIFF' })
Export.image.toDrive({image: ee.Image(ClassiList.get(6)).unmask(-999), folder: 'GEE', region: viablegeo, description: 'classifiedimg2016', scale: 30, skipEmptyTiles: true, fileFormat: 'GeoTIFF' })

Export.image.toDrive({image: ee.Image(ClassiList.get(0)).unmask(-999), folder: 'GEE', region: viablegeo, description: 'classifiedimg2022', scale: 30, skipEmptyTiles: true, fileFormat: 'GeoTIFF' })
Export.image.toDrive({image: ee.Image(ClassiList.get(2)).unmask(-999), folder: 'GEE', region: viablegeo, description: 'classifiedimg2020', scale: 30, skipEmptyTiles: true, fileFormat: 'GeoTIFF' })
Export.image.toDrive({image: ee.Image(ClassiList.get(3)).unmask(-999), folder: 'GEE', region: viablegeo, description: 'classifiedimg2019', scale: 30, skipEmptyTiles: true, fileFormat: 'GeoTIFF' })
Export.image.toDrive({image: ee.Image(ClassiList.get(4)).unmask(-999), folder: 'GEE', region: viablegeo, description: 'classifiedimg2018', scale: 30, skipEmptyTiles: true, fileFormat: 'GeoTIFF' })
Export.image.toDrive({image: ee.Image(ClassiList.get(7)).unmask(-999), folder: 'GEE', region: viablegeo, description: 'classifiedimg2015', scale: 30, skipEmptyTiles: true, fileFormat: 'GeoTIFF' })
Export.image.toDrive({image: ee.Image(ClassiList.get(8)).unmask(-999), folder: 'GEE', region: viablegeo, description: 'classifiedimg2014', scale: 30, skipEmptyTiles: true, fileFormat: 'GeoTIFF' })

/*Export.image.toAsset({image: ee.Image(BackfillList.get(4)), region: GT, description: 'BF2017', assetId: 'm17_BF2017', scale: 30})
Export.image.toAsset({image: ee.Image(BackfillList.get(0)), region: GT, description: 'BF2021', assetId: 'm17_BF2021', scale: 30})*/



/*var dataseTTt = ee.Image("Tsinghua/FROM-GLC/GAIA/v10");
Map.addLayer(ee.Image(dataseTTt.gte(3)).selfMask(), {palette:['F0F0F0']}, 'change to impervious in 2016')*/