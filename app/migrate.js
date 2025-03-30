// const { supabase } = require("./supabase");
// const markers = require("../assets/markers.json");

// async function migrateEvents() {
//     for (const [index, feature] of markers.features.entries()) {
//         try {
//             const { coordinates } = feature.geometry;
//             const { name, type, description, link, photo, date, id } =
//                 feature.properties;

//             const { data, error } = await supabase.from("events").insert([
//                 {
//                     title: name,
//                     type,
//                     description,
//                     link,
//                     photo_url: photo,
//                     date: new Date(date).toISOString(),
//                     location: `SRID=4326;POINT(${coordinates[0]} ${coordinates[1]})`,
//                 },
//             ]);

//             if (error) {
//                 console.error(`Error at index ${index} (ID ${id}):`, error);
//                 console.log("Problematic data:", {
//                     title: name,
//                     type,
//                     date: new Date(date).toISOString(),
//                     coordinates,
//                 });
//             } else {
//                 console.log(
//                     `Inserted ${index + 1}/${markers.features.length}: ${name}`
//                 );
//             }
//         } catch (err) {
//             console.error(`Critical error at index ${index}:`, err);
//         }
//     }
// }

// migrateEvents();
