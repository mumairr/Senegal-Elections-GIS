const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'djibril',
    password: '72342',
    port: 5432,
});

const getBoundary = (type) => {
    return new Promise(function (resolve, reject) {
        const typ = parseInt(type)
        let query = "";
        switch (typ) {
            case 0:
                query = "SELECT json_build_object('type','Feature','geometry',ST_AsGeoJSON(geom)::json,'properties', json_build_object('val', adm0_fr,'id','bound-4','feat_area', ST_Area(geom))) as feature FROM adm0";
                break;
            case 1:
                query = "SELECT json_build_object('type','Feature','geometry',ST_AsGeoJSON(geom)::json,'properties', json_build_object('val', adm1_fr,'id','bound-3','feat_area', ST_Area(geom))) as feature FROM adm1";
                break;
            case 2:
                query = "SELECT json_build_object('type','Feature','geometry',ST_AsGeoJSON(geom)::json,'properties', json_build_object('val', adm2_fr,'id','bound-2','feat_area', ST_Area(geom))) as feature FROM adm2";
                break;
            case 3:
                query = "SELECT json_build_object('type','Feature','geometry',ST_AsGeoJSON(geom)::json,'properties', json_build_object('val', adm3_fr,'id','bound-1','feat_area', ST_Area(geom))) as feature FROM adm3";
                break;
            case 4:
                query = "SELECT json_build_object('type','Feature','geometry',ST_AsGeoJSON(geom)::json,'properties', json_build_object('val', name_4, 'id','bound-0')) as feature  FROM adm4";
                break;
            default:
                break;
        }
        pool.query(query, (error, results) => {
            if (error) {
                reject(error)
            }
            // console.log(results.rows)
            resolve(results.rows);
        })
    })
}

const getData = (typ) => {
    return new Promise(function (resolve, reject) {
        // const typ = (type)
        let query = "";
        switch (typ) {
            case "locales_department":
                query = "SELECT json_build_object('type','Feature','geometry',ST_AsGeoJSON(geom)::json,'properties', json_build_object('a', a, 'b', b, 'c', c, 'd', d, 'e', e, 'f', f, 'g', g, 'h', h, 'i', i, 'j', j, 'k', k, 'l', l, 'm', m, 'n', n, 'o', o, 'p', p, 'q', q, 'r', r, 's', s, 't', t, 'u', u, 'v', v, 'w', w, 'y',y, 'id','data-0','adm1_fr', adm1_fr, 'adm2_fr', adm2_fr,'feat_area', ST_Area(geom))) as feature FROM locales_department";
                break;
            case "presidentielles_department":
                query = "SELECT json_build_object('type','Feature','geometry',ST_AsGeoJSON(geom)::json,'properties', json_build_object('a', a, 'b', b, 'c', c, 'd', d, 'e', e, 'f', f, 'g', g, 'id','data-1','adm1_fr', adm1_fr,'adm2_fr', adm2_fr,'feat_area', ST_Area(geom))) as feature FROM presidentielles_department";
                break;
            case "resultatslocales_department":
                query = "SELECT json_build_object('type','Feature','geometry',ST_AsGeoJSON(geom)::json,'properties', json_build_object('a', a, 'b', b, 'c', c, 'd', d, 'e', e, 'f', f, 'g', g, 'id','data-2','adm1_fr', adm1_fr,'adm2_fr', adm2_fr,'feat_area', ST_Area(geom))) as feature FROM resultatslocales_department";
                break;
            case "resultatspresid_department":
                query = "SELECT json_build_object('type','Feature','geometry',ST_AsGeoJSON(geom)::json,'properties', json_build_object('a', a, 'b', b, 'c', c, 'd', d, 'e', e, 'f', f, 'g', g, 'h', h, 'i', i, 'id','data-3','adm1_fr', adm1_fr,'adm2_fr', adm2_fr,'feat_area', ST_Area(geom))) as feature FROM resultatspresid_department";
                break;
            case "sociodemdata_regions":
                query = "SELECT json_build_object('type','Feature','geometry',ST_AsGeoJSON(geom)::json,'properties', json_build_object('a', a, 'b', b, 'c', c, 'd', d, 'e', e, 'f', f, 'g', g, 'h', h, 'i', i, 'j', j, 'k', k, 'l', l, 'm', m, 'n', n, 'o', o, 'p', p, 'q', q, 'r', r, 's', s, 't', t, 'u', u, 'v', v, 'id','data-4','adm1_fr', adm1_fr, 'feat_area', ST_Area(geom))) as feature  FROM sociodemdata_regions";
                break;
            case "sociodemdata_department":
                query = "SELECT json_build_object('type','Feature','geometry',ST_AsGeoJSON(geom)::json,'properties', json_build_object('a', a, 'b', b, 'c', c, 'd', d, 'e', e, 'f', f, 'g', g, 'h', h, 'i', i, 'j', j, 'k', k, 'id','data-5','adm1_fr', adm1_fr, 'adm2_fr', adm2_fr, 'feat_area', ST_Area(geom))) as feature  FROM sociodemdata_department";
                break;
            default:
                break;
        }
        pool.query(query, (error, results) => {
            if (error) {
                reject(error)
            }
            console.log(query);
            resolve(results.rows);
        })
    })
}


const getLegend = (typ) => {
    return new Promise(function (resolve, reject) {
        // const typ = (type)
        let query = "";
        switch (typ) {
            case "locales_department":
                query = "SELECT unnest(array['A', 'B', 'C','D','E', 'F', 'G','H','I', 'J', 'K','L','M', 'M', 'N','O','P', 'Q', 'R','S','T', 'U', 'V', 'W', 'X', 'Y']) AS col, unnest(array[a, b, c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v]) AS val FROM locales_department ORDER BY col";
                break;
            case "presidentielles_department":
                query = "SELECT unnest(array['A', 'B', 'C','D','E', 'F', 'G']) AS col, unnest(array[a, b, c,d,e,f,g]) AS val FROM presidentielles_department ORDER BY col";
                break;
            case "resultatslocales_department":
                query = "SELECT unnest(array['A', 'B', 'C','D','E', 'F', 'G','H','I', 'J', 'K','L','M', 'M', 'N','O','P', 'Q', 'R','S','T', 'U', 'V', 'W', 'X', 'Y']) AS col, unnest(array[a, b, c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y]) AS val FROM resultatslocales_department ORDER BY col";
                break;
            case "resultatspresid_department":
                query = "SELECT unnest(array['A', 'B', 'C','D','E', 'F', 'G','H','I']) AS col, unnest(array[a, b, c,d,e,f,g,h,i]) AS val FROM resultatspresid_department ORDER BY col";
                break;
            case "sociodemdata_department":
                query = "SELECT unnest(array['A', 'B', 'C','D','E', 'F', 'G','H','I', 'J', 'K']) AS col, unnest(array[a, b, c,d,e,f,g,h,i,j,k]) AS val FROM sociodemdata_department ORDER BY col";
                break;
            case "sociodemdata_regions":
                query = "SELECT unnest(array['A', 'B', 'C','D','E', 'F', 'G','H','I', 'J', 'K','L','M', 'M', 'N','O','P', 'Q', 'R','S','T', 'U', 'V']) AS col, unnest(array[a, b, c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v]) AS val FROM sociodemdata_regions ORDER BY col";
                break;
            default:
                break;
        }
        pool.query(query, (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(results.rows);
        })
    })
}
// const createMerchant = (body) => {
//     return new Promise(function (resolve, reject) {
//         const { name, email } = body
//         pool.query('INSERT INTO merchants (name, email) VALUES ($1, $2) RETURNING *', [name, email], (error, results) => {
//             if (error) {
//                 reject(error)
//             }
//             resolve(`A new merchant has been added added: ${results.rows[0]}`)
//         })
//     })
// }
// const deleteMerchant = () => {
//     return new Promise(function (resolve, reject) {
//         const id = parseInt(request.params.id)
//         pool.query('DELETE FROM merchants WHERE id = $1', [id], (error, results) => {
//             if (error) {
//                 reject(error)
//             }
//             resolve(`Merchant deleted with ID: ${id}`)
//         })
//     })
// }

module.exports = {
    getBoundary,
    getData,
    getLegend
    // createMerchant,
    // deleteMerchant,
}