/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var BF1 = /* color: #00ff00 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.47801488303041, -18.85274656992114]),
            {
              "id": 1,
              "backfill": "",
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([47.47947400473451, -18.84771047868427]),
            {
              "id": 1,
              "backfill": "",
              "system:index": "1"
            })]),
    BF2 = /* color: #009999 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.518097814548966, -18.87418887892529]),
            {
              "id": 2,
              "backfill": "",
              "system:index": "0"
            })]),
    BF3 = /* color: #999900 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.499644216526505, -18.934764810345833]),
            {
              "id": 3,
              "backfill": "",
              "system:index": "0"
            })]),
    BF4 = /* color: #ff00ff */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.48333638571596, -18.924697409066013]),
            {
              "id": 4,
              "backfill": "",
              "system:index": "0"
            })]),
    BF5 = /* color: #ff9999 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.516638692844865, -18.957634146098435]),
            {
              "id": 5,
              "backfill": "",
              "system:index": "0"
            })]),
    BF6 = /* color: #99ff99 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.53097241782045, -18.95877059433228]),
            {
              "id": 6,
              "backfill": "",
              "system:index": "0"
            })]),
    BF7 = /* color: #ff99ff */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.52275518233396, -18.968822080186417]),
            {
              "id": 7,
              "backfill": "",
              "system:index": "0"
            })]),
    BF8 = /* color: #99ffff */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.58132820125402, -18.929510607088172]),
            {
              "id": 8,
              "backfill": "",
              "system:index": "0"
            })]),
    BF9 = /* color: #d63000 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.527479399184756, -18.887259822781733]),
            {
              "id": 9,
              "backfill": "",
              "system:index": "0"
            })]),
    BF10 = /* color: #98ff00 */ee.FeatureCollection([]),
    stillBarren2021 = /* color: #9999ff */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.4678010311017, -18.864848816204994]),
            {
              "id": 2021,
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([47.48385136984682, -18.881254493599663]),
            {
              "id": 2021,
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([47.440210792493296, -18.83279172809921]),
            {
              "id": 2021,
              "system:index": "2"
            })]),
    image = ee.Image("projects/ee-cjoseph/assets/Backfill_Validation/BF2021");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana')
var viable = ee.FeatureCollection('projects/ee-cjoseph/assets/viable_areas')
var classes = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/classes')
var classes_poly = ee.FeatureCollection('projects/ee-cjoseph/assets/training_data/classes_poly');


/*var dataset = ee.ImageCollection("LANDSAT/LT05/C02/T1_TOA")
    .filterBounds(GT)
    .filter(ee.Filter.calendarRange(1985, 2015, 'year'))//2013 - 2021
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


function addImageTOA(image) { // display each image in collection
  var id = image.id
  var image = ee.Image(image.id)
  Map.addLayer(image, {bands: ['B3', 'B2', 'B1'], min: 0.0, max: 0.4, gamma: 1.3},id.slice(-8))//get('DATE_ACQUIRED')
}

filteredCollection.evaluate(function(filteredCollection) {  // use map on client-side
  filteredCollection.features.map(addImageTOA)
});*/

Map.addLayer(ee.Image('LANDSAT/LT05/C02/T1_TOA/LT05_159073_19990502'), {bands: ['B3', 'B2', 'B1'], min: 0.0, max: 0.4, gamma: 1.3},'LT51999')//get('DATE_ACQUIRED')
Map.addLayer(ee.Image('LANDSAT/LT05/C02/T1_TOA/LT05_159073_20060521'), {bands: ['B3', 'B2', 'B1'], min: 0.0, max: 0.4, gamma: 1.3},'LT52006')//get('DATE_ACQUIRED')
Map.addLayer(ee.Image('LANDSAT/LT05/C02/T1_TOA/LT05_159073_20081001'), {bands: ['B3', 'B2', 'B1'], min: 0.0, max: 0.4, gamma: 1.3},'LT52008')//get('DATE_ACQUIRED')
Map.addLayer(ee.Image('LANDSAT/LT05/C02/T1_TOA/LT05_159073_20101124'), {bands: ['B3', 'B2', 'B1'], min: 0.0, max: 0.4, gamma: 1.3},'LT52010')//get('DATE_ACQUIRED')
