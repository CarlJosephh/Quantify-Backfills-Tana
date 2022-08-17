/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var image = ee.Image("projects/ee-cjoseph/assets/Backfill_Validation/BF2013"),
    image2 = ee.Image("projects/ee-cjoseph/assets/Backfill_Validation/BF2021"),
    BF1 = /* color: #ff99ff */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.49536669541243, -18.89741116063292]),
            {
              "id": 1,
              "backfill": "",
              "system:index": "0"
            })]),
    BF2 = /* color: #d63000 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.49160660139493, -18.937570044046026]),
            {
              "id": 2,
              "backfill": "",
              "system:index": "0"
            })]),
    BF3 = /* color: #98ff00 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.530144580520904, -18.948367287913857]),
            {
              "id": 3,
              "backfill": "",
              "system:index": "0"
            })]),
    BF4 = /* color: #0b4a8b */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.50001800886563, -18.935053292876074]),
            {
              "id": 4,
              "backfill": "",
              "system:index": "0"
            })]),
    BF5 = /* color: #ffc82d */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.47830939331593, -18.854050283792834]),
            {
              "id": 5,
              "backfill": "",
              "system:index": "0"
            })]),
    BF6 = /* color: #00ffff */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.51746819442609, -18.874403468043113]),
            {
              "id": 6,
              "backfill": "",
              "system:index": "0"
            })]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20130609')
Map.addLayer(ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20130609'), {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'LC8201', true)

Map.addLayer(image2,{min:0, max:3, palette:['0329FF']}, 'backfills21', true);
Map.addLayer(image,{min:0, max:3, palette:['FF4C33']}, 'backfills13', true);