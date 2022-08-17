/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var image = ee.Image("projects/ee-cjoseph/assets/Backfill_Validation/BF2018"),
    verification2017 = 
    /* color: #03ff1b */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.4404488240687, -18.83304665746576]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([47.429069369841756, -18.817814011218207]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([47.44122560259645, -18.82819570467723]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([47.45712573763673, -18.831688899615777]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([47.45354230639283, -18.825433592151022]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([47.46466420909032, -18.811085666603923]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([47.465822923384756, -18.81242622363536]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([47.48670123835668, -18.80495146632374]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([47.48927615901098, -18.805723331640287]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([47.505107976124705, -18.776268066955005]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([47.5014869939546, -18.786801455082756]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([47.500601864979686, -18.788142205547683]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([47.49124046399581, -18.88767160136971]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([47.50810619428145, -18.87175385406821]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([47.517075501227254, -18.886818903249573]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([47.58074612298195, -18.92914959777898]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([47.60237606781978, -18.952031302401142]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([47.541072889384104, -18.880079121804155]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([47.46975504818468, -18.93930085847691]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([47.47938364879846, -18.94331810408431]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([47.472760545231516, -18.934592090669735]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([47.4702178110854, -18.933216991078456]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([47.525439130284006, -18.913522902547584]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([47.514989243961985, -18.916263265126762]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([47.52715574405354, -18.918699105268576]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([47.53953682086628, -18.905200044612926]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51619087360066, -18.904347435782157]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([47.50443206927937, -18.89437971028247]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([47.52033220431965, -18.87742712381126]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([47.514713399452276, -18.82449906301127]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([47.4548672345985, -18.82861419787712]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([47.46006242378883, -18.820429776880026]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([47.461739074958004, -18.81705262308562]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([47.46325720526043, -18.819251256105478]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([47.45838631368939, -18.813543890519806]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([47.60392734476432, -18.892558594363976]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([47.601134067989165, -18.901773915839634]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([47.38880302463756, -18.866379572925712]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "37"
            })]),
    verification13 = 
    /* color: #00ffd5 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.4995260796559, -18.934813740828464]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([47.48358302927138, -18.92466515133531]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([47.48963409280898, -18.913866375337083]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51935296869399, -18.924401279786377]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([47.519542096866466, -18.944375494620708]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([47.53018510223756, -18.94851570490778]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([47.535077451480724, -18.948921602348992]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([47.52864014984498, -18.953061699855088]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([47.52314698578248, -18.958581670055768]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([47.52117287994752, -18.955984059773197]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([47.52273929001222, -18.968971706591333]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([47.60260474563966, -18.934105706284218]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([47.4962605226172, -18.897780962284752]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([47.4676789033545, -18.864808797546505]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([47.47819316269288, -18.85418891776159]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([47.440446158595506, -18.831152245089715]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([47.456689616389696, -18.832919129816467]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([47.481194277949754, -18.815554111976493]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([47.472072085090105, -18.80319655583415]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([47.484817942328874, -18.800159809145192]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([47.49234958524269, -18.803958272995445]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51616760129494, -18.789237553422875]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([47.542834016466756, -18.79378154259051]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([47.54618141331734, -18.79510192400161]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([47.479640021630466, -18.846841502021014]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51539729788472, -18.85181224664386]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([47.545438038851515, -18.868097371719877]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([47.5172855730312, -18.874269873612846]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([47.509905036247034, -18.877179505997116]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([47.50906394415902, -18.88787604127647]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([47.527431711493, -18.887348181691785]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51088887572144, -18.889041598080567]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([47.5174549233899, -18.887336211450165]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([47.50921517729615, -18.88388478060833]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([47.52376978006683, -18.872064183677608]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51922075357757, -18.892773163213466]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([47.528318806556086, -18.8912302294917]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([47.50686239020915, -18.88124141989392]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51029561774821, -18.885322286035432]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([47.46448348777385, -18.897016157624552]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([47.50817130820842, -18.919264740125033]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([47.52688239829631, -18.920685625676114]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([47.467315900493574, -18.946137728381586]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([47.47493337409587, -18.94749750029832]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([47.492754120598505, -18.947821372048363]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([47.54233830633669, -18.852507794816315]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([47.4976205176404, -18.818064364268043]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([47.50907891455202, -18.78304505897385]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([47.50510924520998, -18.78296379921486]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51222514572649, -18.787430488450664]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "49"
            }),
        ee.Feature(
            ee.Geometry.Point([47.48383128109484, -18.881975077406643]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "50"
            }),
        ee.Feature(
            ee.Geometry.Point([47.526574963956165, -18.862645530456675]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "51"
            }),
        ee.Feature(
            ee.Geometry.Point([47.49207102718859, -18.937190059358326]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "52"
            }),
        ee.Feature(
            ee.Geometry.Point([47.60179925582486, -18.90412876587885]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "53"
            })]),
    verification21 = 
    /* color: #0b4a8b */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([47.469258409826764, -18.801507555382397]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([47.49526510843516, -18.81141986465482]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([47.473979097692975, -18.783550164263964]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([47.490372759192, -18.799395020545823]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "3"
            }),
        ee.Feature(
            ee.Geometry.Point([47.41847012667108, -18.855464498566388]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "4"
            }),
        ee.Feature(
            ee.Geometry.Point([47.43233178286005, -18.83849782267017]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "5"
            }),
        ee.Feature(
            ee.Geometry.Point([47.42798660425592, -18.84015293595305]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "6"
            }),
        ee.Feature(
            ee.Geometry.Point([47.42976759104181, -18.841584646553667]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "7"
            }),
        ee.Feature(
            ee.Geometry.Point([47.445095478304694, -18.82326624392464]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "8"
            }),
        ee.Feature(
            ee.Geometry.Point([47.477769231208086, -18.84052247768597]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "9"
            }),
        ee.Feature(
            ee.Geometry.Point([47.52811199019685, -18.876137716486568]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "10"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51141792128816, -18.87191449733874]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "11"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51107459853425, -18.868016046754637]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "12"
            }),
        ee.Feature(
            ee.Geometry.Point([47.5087786276175, -18.874533717901908]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "13"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51609569381013, -18.87384338467168]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "14"
            }),
        ee.Feature(
            ee.Geometry.Point([47.50390773604646, -18.879853249168548]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "15"
            }),
        ee.Feature(
            ee.Geometry.Point([47.50735169242158, -18.871224153320394]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "16"
            }),
        ee.Feature(
            ee.Geometry.Point([47.50991588423982, -18.873508368991008]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "17"
            }),
        ee.Feature(
            ee.Geometry.Point([47.50536368329163, -18.88223974459382]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "18"
            }),
        ee.Feature(
            ee.Geometry.Point([47.50976921159859, -18.889137527421898]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "19"
            }),
        ee.Feature(
            ee.Geometry.Point([47.527106157842205, -18.890229615825202]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "20"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51875912338786, -18.893587502000628]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "21"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51766478210978, -18.893384486205573]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "22"
            }),
        ee.Feature(
            ee.Geometry.Point([47.50998293549113, -18.896957528232374]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "23"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51267050892405, -18.894490919303124]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "24"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51276706844859, -18.89615563055159]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "25"
            }),
        ee.Feature(
            ee.Geometry.Point([47.5215670730522, -18.894586441803128]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "26"
            }),
        ee.Feature(
            ee.Geometry.Point([47.503682288306024, -18.920073504147663]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "27"
            }),
        ee.Feature(
            ee.Geometry.Point([47.50324431633553, -18.90924851034394]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "28"
            }),
        ee.Feature(
            ee.Geometry.Point([47.510374576533884, -18.935785461823887]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "29"
            }),
        ee.Feature(
            ee.Geometry.Point([47.571440429175944, -18.913914611606913]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "30"
            }),
        ee.Feature(
            ee.Geometry.Point([47.58680412241325, -18.914523583523675]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "31"
            }),
        ee.Feature(
            ee.Geometry.Point([47.58371421762809, -18.920410197700416]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "32"
            }),
        ee.Feature(
            ee.Geometry.Point([47.57920810648307, -18.929462999746505]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "33"
            }),
        ee.Feature(
            ee.Geometry.Point([47.58268424936637, -18.932223397854862]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "34"
            }),
        ee.Feature(
            ee.Geometry.Point([47.595344275916666, -18.935552052550676]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "35"
            }),
        ee.Feature(
            ee.Geometry.Point([47.59229728647575, -18.9076217719473]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "36"
            }),
        ee.Feature(
            ee.Geometry.Point([47.60281154581413, -18.892680404471463]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "37"
            }),
        ee.Feature(
            ee.Geometry.Point([47.566909080959135, -18.89535881143036]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "38"
            }),
        ee.Feature(
            ee.Geometry.Point([47.51750327914722, -18.95912701319092]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "39"
            }),
        ee.Feature(
            ee.Geometry.Point([47.537115591464115, -18.950197587580234]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "40"
            }),
        ee.Feature(
            ee.Geometry.Point([47.544625776705814, -18.95117172996235]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "41"
            }),
        ee.Feature(
            ee.Geometry.Point([47.54745818942554, -18.950481713029124]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "42"
            }),
        ee.Feature(
            ee.Geometry.Point([47.549131887850834, -18.953282352280162]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "43"
            }),
        ee.Feature(
            ee.Geometry.Point([47.546127813754154, -18.953525883906437]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "44"
            }),
        ee.Feature(
            ee.Geometry.Point([47.54865981906421, -18.96322627121438]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "45"
            }),
        ee.Feature(
            ee.Geometry.Point([47.54917480319507, -18.966878990486798]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "46"
            }),
        ee.Feature(
            ee.Geometry.Point([47.545870321688724, -18.970247538435874]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "47"
            }),
        ee.Feature(
            ee.Geometry.Point([47.54415370791919, -18.97718734429452]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "48"
            }),
        ee.Feature(
            ee.Geometry.Point([47.55371310084827, -18.983771775892755]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "49"
            }),
        ee.Feature(
            ee.Geometry.Point([47.54353143542774, -18.972606496094002]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "50"
            }),
        ee.Feature(
            ee.Geometry.Point([47.388931764761125, -18.865880351623748]),
            {
              "backfill": "",
              "notes": "",
              "system:index": "51"
            })]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
//ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20180506')
//Map.addLayer(ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20180506'), {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'LC8201', true)
//load boundary Layers
var GT = ee.FeatureCollection('users/cjoseph/Greater_Tana')
var viable = ee.FeatureCollection('projects/ee-cjoseph/assets/viable_areas')

Map.centerObject(GT, 13)

//sorting and cloud masking
  //Load Landsat8
var dataset = ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
    .filterBounds(GT)
    .filterDate('2016-10-01', '2017-05-01')
    //.filter(ee.Filter.calendarRange(2016, 2014, 'year'))  
    //.filter(ee.Filter.calendarRange(5, 7, 'month'))
print(dataset, 'dataset')
  //Function allowing cloudieness sort over ROI
function ROICC (image) {//###FUNCTION SEEMS TO ONLY WORK FOR TOA IMAGES
  var cloud = ee.Algorithms.Landsat.simpleCloudScore(image).select('cloud');//'cloud'
  var cloudiness = cloud.reduceRegion({
    reducer: 'mean', 
    geometry: GT, 
    scale: 30,
  });
  return image.set(cloudiness);
}
  //Function to cloudmask the collection
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
  //apply both functions
var withCloudiness = dataset.map(ROICC).map(maskL8sr)

    //filter collection for cloudieness overROI, adjust boundary value for CC filtering
var cloudfreeImage = withCloudiness.filter(ee.Filter.lte('cloud', 25));//'cloud'
print(cloudfreeImage, 'fC', false);

var masked = cloudfreeImage.map(maskL8sr)
//Map.addLayer(cloudfreeImage.mean(), {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'cloudfreeImage', false);
//display the median image of the remaining cloud free images
var Landsat17m = cloudfreeImage.median() //.name(Landsat17)
Map.addLayer(Landsat17m, {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'LS8_rainseason_2017', true)
print(Landsat17m, 'maskedmean')  
Map.addLayer(ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20130609'), {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'LC08_2013', true)
Map.addLayer(ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20210530'), {bands: ['B4', 'B3', 'B2'], min: 0, max: 0.3}, 'LC08_2021', true)

Map.addLayer(ee.Image('projects/ee-cjoseph/assets/Backfill_Validation/m17_BF2021'),{min:0, max:3, palette:['FF0000']}, 'backfills21', true);
Map.addLayer(ee.Image('projects/ee-cjoseph/assets/Backfill_Validation/m17_BF2017'),{min:0, max:3, palette:['FF8300']}, 'backfills17', true);
Map.addLayer(ee.Image('projects/ee-cjoseph/assets/Backfill_Validation/m17_BF2013'),{min:0, max:3, palette:['FFF000']}, 'backfills13', true);



/*Export.image.toDrive({image: ee.Image('projects/ee-cjoseph/assets/Backfill_Validation/m17_BF2013'), region: GT, description: 'm17BF2013', folder: 'GEE', scale: 30})
Export.image.toDrive({image: ee.Image('projects/ee-cjoseph/assets/Backfill_Validation/m17_BF2017'), region: GT, description: 'm17BF2017', folder: 'GEE', scale: 30})
Export.image.toDrive({image: ee.Image('projects/ee-cjoseph/assets/Backfill_Validation/m17_BF2021'), region: GT, description: 'm17BF2021', folder: 'GEE', scale: 30})

Export.table.toDrive({collection: verification2017,  description:'verification2017' , folder: 'GEE', fileFormat: 'SHP'})
Export.table.toDrive({collection: verification13,  description:'verification13' , folder: 'GEE', fileFormat: 'SHP'})
Export.table.toDrive({collection: verification21,  description:'verification21' , folder: 'GEE', fileFormat: 'SHP'})*/


/*var projection1 = Landsat17m.select('B2').projection().getInfo();
var projection2 = ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20130609').select('B2').projection().getInfo();
var projection3 = ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20210530').select('B2').projection().getInfo();*/

Export.image.toDrive({
  image: Landsat17m.select(['B5', 'B4', 'B3', 'B2']), 
  description: 'LS8_rainseason_2017cr', 
  folder: 'GEE', 
  region: GT, 
  scale:30,
 /* crs: projection1.crs,
  crsTransform: projection1.transform,*/
})
Export.image.toDrive({
  image: ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20130609').select(['B5', 'B4', 'B3', 'B2']), 
  description: 'LC08_2013cr', 
  folder: 'GEE', 
  region: GT, 
  scale:30,
 /* crs: projection2.crs,
  crsTransform: projection2.transform,*/
  
})
Export.image.toDrive({
  image: ee.Image('LANDSAT/LC08/C02/T1_TOA/LC08_159073_20210530').select(['B5', 'B4', 'B3', 'B2']), 
  description: 'LC08_2021cr', 
  folder: 'GEE', 
  region: GT, 
  scale:30,
  /*crs: projection3.crs,
  crsTransform: projection3.transform,*/
  
})
