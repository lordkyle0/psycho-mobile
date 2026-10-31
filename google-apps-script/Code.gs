/**
 * Psycho — synchronisation Google Sheets.
 *
 * Installation :
 *  1. Crée un Google Sheet vide, puis Extensions > Apps Script.
 *  2. Colle ce fichier dans Code.gs.
 *  3. Paramètres du projet (⚙️) > Propriétés du script > ajoute SYNC_TOKEN = <un secret long et aléatoire>.
 *  4. Déployer > Nouveau déploiement > Type « Application Web »
 *       - Exécuter en tant que : Moi
 *       - Qui a accès : Tout le monde
 *  5. Dans le fichier .env de l'app : PSYCHO_SHEETS_SYNC_URL=<URL …/exec> et
 *     PSYCHO_SHEETS_SYNC_TOKEN=<SYNC_TOKEN>, puis reconstruire l'app (npm start -- --reset-cache).
 *
 * Après toute modification du script : Déployer > Gérer les déploiements > Modifier > Nouvelle version.
 */

var TABLES = ['checkins', 'archetype_scores', 'program_log', 'goals', 'reviews'];
var SYNCED_AT = '_synced_at';

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var expected = PropertiesService.getScriptProperties().getProperty('SYNC_TOKEN');
    if (!expected) return json_({ ok: false, error: 'SYNC_TOKEN non défini dans les propriétés du script' });
    if (body.token !== expected) return json_({ ok: false, error: 'Jeton invalide' });

    var lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var serverTime = new Date().toISOString();
      var changes = body.changes || {};
      var since = body.since || '';
      var out = {};

      TABLES.forEach(function (table) {
        var sheet = getSheet_(ss, table);
        var rows = changes[table] || [];
        if (rows.length) upsert_(sheet, rows, serverTime);
        out[table] = readSince_(sheet, since);
      });

      return json_({ ok: true, serverTime: serverTime, changes: out });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** Permet de vérifier le déploiement depuis un navigateur. */
function doGet() {
  return json_({ ok: true, service: 'psycho-sync', tables: TABLES });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, 3).setValues([['id', 'updated_at', SYNCED_AT]]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function headers_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
}

/** Insère ou remplace les lignes par id, en ajoutant les colonnes manquantes. */
function upsert_(sheet, rows, serverTime) {
  var headers = headers_(sheet);
  var oldWidth = headers.length;
  rows.forEach(function (r) {
    Object.keys(r).forEach(function (k) {
      if (headers.indexOf(k) === -1) headers.push(k);
    });
  });
  if (headers.indexOf(SYNCED_AT) === -1) headers.push(SYNCED_AT);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');

  var lastRow = sheet.getLastRow();
  var data = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, oldWidth).getValues() : [];
  data = data.map(function (row) {
    while (row.length < headers.length) row.push('');
    return row;
  });
  var idCol = headers.indexOf('id');
  var updCol = headers.indexOf('updated_at');
  var index = {};
  data.forEach(function (row, i) {
    index[String(row[idCol])] = i;
  });

  rows.forEach(function (r) {
    var id = String(r.id);
    var existing = index[id];
    // Dernier écrit gagne : on ignore une version plus ancienne que celle déjà présente.
    if (existing !== undefined && String(data[existing][updCol]) > String(r.updated_at)) return;
    var line = headers.map(function (h) {
      if (h === SYNCED_AT) return serverTime;
      var v = r[h];
      return v === null || v === undefined ? '' : String(v);
    });
    if (existing !== undefined) {
      data[existing] = line;
    } else {
      index[id] = data.length;
      data.push(line);
    }
  });

  if (data.length) {
    var range = sheet.getRange(2, 1, data.length, headers.length);
    range.setNumberFormat('@');
    range.setValues(data);
  }
}

function readSince_(sheet, since) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var headers = headers_(sheet);
  var syncedCol = headers.indexOf(SYNCED_AT);
  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var out = [];
  values.forEach(function (row) {
    if (since && syncedCol !== -1 && String(row[syncedCol]) <= since) return;
    var obj = {};
    headers.forEach(function (h, i) {
      if (h !== SYNCED_AT) obj[h] = row[i] === '' ? null : String(row[i]);
    });
    out.push(obj);
  });
  return out;
}
