const { Schema, model } = require("mongoose");
const ExpenseFile = require("./expenseFileModel");
const moment = require("moment");

/** Bank expense model
 *{
    "date traitement": "26/10/2023",
    "numero contractant": "300030228040285569",
    "numero contrat": "23101706",
    "code lieu opération": "ET",
    "nom titulaire": "GERVAL",
    "identifiant salarié": "1",
    "numéro carte": "523414XXXXXX4111",
    "date création carte": "27/10/2021",
    "date de vente": "15/10/2023",
    "date d'arrêté": "09/11/2023",
    "date de prise en compte": "19/10/2023",
    "code opération": "417",
    "sous code opération": "037",
    "sens opération": "C",
    "montant imputé": "120,30",
    "code devise origine": "KRW",
    "montant brut devise origine": "1641,98",
    "raison sociale commerçant": "HOTEL SUNSHINE SEOUL",
    "code département": "",
    "code pays": "KR",
    "localite": "SEOUL",
    "code MCC": "7011",
    "heure opération": "",
    "zone exécution": "OUT",
    "sens opération_1": "C",
    "numéro siret commerçant": "0921426060",
    "code commission porteur1": "01",
    "montant commission porteur1": "4,13",
    "code commission porteur2": "",
    "montant commission porteur2": "0,00",
    "code commission porteur3": "",
    "montant commission porteur3": "0,00"
  }
 */
const expenseSchema = new Schema({
  originFile: {
    type: Schema.Types.ObjectId,
    ref: ExpenseFile.DB_COLLECTION_NAME,
    required: true,
  },
  // date traitement
  treatmented_at: {
    type: Date,
  },
  // numero contractant
  contracting_by_number: {
    type: String,
  },
  // numero contrat
  contract_number: {
    type: String,
  },
  // code lieu opération
  operation_location_code: {
    type: String,
  },
  // nom titulaire
  titular_name: {
    type: String,
  },
  // identifiant salarié
  employee_identifier: {
    type: String,
  },
  // numéro carte
  card_number: {
    type: String,
  },
  // date création carte
  card_created_at: {
    type: Date,
  },
  // date de vente
  sold_at: {
    type: Date,
  },
  // date d'arrêté
  closed_at: {
    type: Date,
  },
  // date de prise en compte
  taken_into_account_at: {
    type: Date,
  },
  // code opération
  operation_code: {
    type: String,
  },
  // sous code opération
  under_code_operation: {
    type: String,
  },
  // sens opération
  direction_of_operation: {
    type: String,
  },
  // montant imputé
  amount_charged: {
    type: String,
  },
  // code devise origine
  origin_currency_code: {
    type: String,
  },
  // montant brut devise origine
  total_amount_original_currency: {
    type: String,
  },
  // raison sociale commerçant
  trader_company_name: {
    type: String,
  },
  // code département
  code_department: {
    type: String,
  },
  // code pays
  country_code: {
    type: String,
  },
  // localité
  locality: {
    type: String,
  },
  // code MCC
  code_mcc: {
    type: String,
  },
  // heure opération
  operation_time: {
    type: String,
  },
  // zone exécution
  execution_area: {
    type: String,
  },
  // numéro siret commerçant
  merchant_siret_number: {
    type: String,
  },
  // commission amount 1
  commission_amount_1: {
    type: String,
  },
  // commission amount 2
  commission_amount_2: {
    type: String,
  },
  // commission amount 3
  commission_amount_3: {
    type: String,
  },
  etc: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  deleted_at: {
    type: Date,
  },
});

// For new column, you need to add that new correct value array
const match_fields = {
  treatmented_at: ["date traitement"],
  contracting_by_number: ["numero contractant"],
  contract_number: ["numero contrat"],
  operation_location_code: ["code lieu opération"],
  titular_name: ["nom titulaire"],
  employee_identifier: ["identifiant salarié"],
  card_number: ["numéro carte"],
  card_created_at: ["date création carte"],
  sold_at: ["date de vente"],
  closed_at: ["date d'arrêté"],
  taken_into_account_at: ["date de prise en compte"],
  operation_code: ["code opération"],
  under_code_operation: ["sous code opération"],
  direction_of_operation: ["sens opération"],
  amount_charged: ["montant imputé"],
  origin_currency_code: ["code devise origine"],
  total_amount_original_currency: ["montant brut devise origine"],
  trader_company_name: ["raison sociale commerçant"],
  code_department: ["code département"],
  country_code: ["code pays"],
  locality: ["localite"],
  code_mcc: ["code MCC"],
  operation_time: ["heure opération"],
  execution_area: ["zone exécution"],
  merchant_siret_number: ["numéro siret commerçant"],
  commission_amount_1: ["montant commission porteur1"],
  commission_amount_2: ["montant commission porteur2"],
  commission_amount_3: ["montant commission porteur3"],
};

const parseExpenses = (_data, originFileID) => {
  const results = [];
  const match_key_model = getMatchModel(_data[0]);
  _data.forEach((item) => {
    var _object = {
      originFile: originFileID,
    };
    Object.keys(match_key_model).forEach((key) => {
      if (key.endsWith("_at")) {
        _object[key] = moment(
          item[match_key_model[key]],
          "DD/MM/YYYY",
          true
        ).format("YYYY-MM-DD");
      } else {
        _object[key] = item[match_key_model[key]];
      }
    });
    results.push(_object);
  });

  return results;
};

// Generate [key:key] iterator model to use matching
const getMatchModel = (item) => {
  const field_keys = Object.keys(match_fields);
  const _model = {};
  const item_keys = Object.keys(item);
  field_keys.forEach((key) => {
    item_keys.forEach((item_key) => {
      if (match_fields[key].includes(item_key)) {
        _model[key] = item_key;
      }
    });
  });
  return _model;
};

//Set updated date before updating expense
expenseSchema.pre("findOneAndUpdate", async function (next) {
  this.set({ updated_at: new Date() });
});

const REF_NAME = {
  ORIGIN_FILE: "originFile",
};

const DB_COLLECTION_NAME = "expenses";

const Expense = model(DB_COLLECTION_NAME, expenseSchema);

module.exports = {
  Expense,
  REF_NAME,
  DB_COLLECTION_NAME,
  parseExpenses,
};
