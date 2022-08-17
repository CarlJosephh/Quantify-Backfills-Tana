//path to models
var ImageClassification = require('users/cjoseph/tana22:modules/3_Classification_BFArea.js');

//import model elements
var ClassiList = ImageClassification.ClassiList

//region of interest
var viable = ee.FeatureCollection('projects/ee-cjoseph/assets/viable_watershed')




//create exportable LC distribution data
//list with class values
var values = ee.List.sequence(0, 13, 1)

//function counting pixels per class values and creating a feature each
var classcount = values.map(function call(i){
  var img = ee.Image(ClassiList.get(5)).eq(ee.Number(i)).selfMask()
  var red = img.reduceRegion({reducer:ee.Reducer.count(),
                              geometry: viable, 
                              scale: 30, 
                              bestEffort: true,})
  return ee.Feature(null,{ classcount: red.get('classification'), LC: i})
})
//print(classcount, 'classcount')

//create feature collection and export
var classcount_features = ee.FeatureCollection(classcount.flatten())
print(classcount_features, 'classcount_features')
Export.table.toDrive({collection: classcount_features,
                      description: 'classcount_features17', 
                      folder: 'GEEData', 
                      fileFormat: 'CSV', 
                      selectors: ['LC', 'classcount']
})
//compare added value of all classes with separate class image pixel count to see if pixel count matches
var suum = classcount.map(function combie(element){
  var num = ee.Feature(element).get('classcount')
  return num
})
print(suum.reduce(ee.Reducer.sum()), 'sum of separate classcounts')

var LC_dist_ROI = ee.Image(ClassiList.get(5)).reduceRegion({reducer:ee.Reducer.count(),
                                                            geometry: viable, 
                                                            scale: 30, 
                                                            bestEffort: true, 
                                                            //maxPixels, 
                                                            //tileScale
})
print(LC_dist_ROI, 'LC_dist_ROI')

