const SERIES = {
  EC:{name:'EURECO EC',bg:'#10b981',border:'#fbbf24',ghs:['GHS02','GHS07']},
  CF:{name:'CARTOFLEX CF',bg:'#dc2626',border:'#fcd34d',ghs:['GHS07']},
  PLUV:{name:'UVIPLAST PLUV',bg:'#2563eb',border:'#fbbf24',ghs:['GHS07','GHS08','GHS09']},
  PLUV_LED:{name:'UVIPLAST PLUV LED',bg:'#2563eb',border:'#fbbf24',ghs:['GHS07','GHS08','GHS09']},
  SX:{name:'SICOTEX SX',bg:'#fbbf24',border:'#000',ghs:[]},
  SPTN:{name:'SICOPLAST SPTN',bg:'#7e22ce',border:'#fcd34d',ghs:[]},
  TPP:{name:'POLYPRO TPP',bg:'#a78bfa',border:'#fbbf24',ghs:['GHS07','GHS02','GHS08']},
  AS:{name:'AQUASET AS',bg:'#0e7a7a',border:'#fbbf24',ghs:[]},
  OTF:{name:'OPATEX OTF',bg:'#2563eb',border:'#fbbf24',ghs:[]},
  NST:{name:'SICONYL NST',bg:'#1e293b',border:'#fbbf24',ghs:['GHS02']},
  QS:{name:'QUICKSET QS',bg:'#f97316',border:'#fcd34d',ghs:['GHS02']},
  SN:{name:'SICONYL SN',bg:'#6b7280',border:'#fbbf24',ghs:['GHS02']}
};

const SAFETY = {
  EC:{uk:{contains:'1-етоксипропан-2-ол',hazards:['H226 - Легкозаймиста рідина і пари','H336 - Може викликати сонливість'],precautions:['P271 - У добре вентильованому','P405 - Зберігати під замком']},en:{contains:'1-ethoxypropan-2-ol',hazards:['H226 - Flammable','H336 - Drowsiness'],precautions:['P271 - Ventilation','P405 - Lock up']},pl:{contains:'1-etoksypropan-2-ol',hazards:['H226 - Łatwopalna','H336 - Senność'],precautions:['P271 - Wentylacja','P405 - Przechowywać zamknięte']}},
  CF:{uk:{contains:'1-етоксипропан-2-ол',hazards:['H336 - Сонливість'],precautions:['P271 - Вентиляція','P405 - Замкнене зберігання']},en:{contains:'1-ethoxypropan-2-ol',hazards:['H336 - Drowsiness'],precautions:['P271 - Ventilation','P405 - Lock up']},pl:{contains:'1-etoksypropan-2-ol',hazards:['H336 - Może wywoływać senność'],precautions:['P271 - Wentylacja','P405 - Przechowywać zamknięte']}},
  PLUV:{uk:{contains:'Ацетат 2-етокси-1-метилетилу',hazards:['H226 - Легкозаймиста','H304 - Смертельно при ковтанні','H336 - Сонливість','H412 - Шкідливо для води'],precautions:['P210 - Подалі від тепла','P280 - Засоби захисту','P301+P310 - Лікар']},en:{contains:'2-ethoxy-1-methylethyl acetate',hazards:['H226 - Flammable','H304 - Fatal if swallowed','H336 - Drowsiness','H412 - Aquatic toxicity'],precautions:['P210 - Keep away from heat','P280 - Protective gloves','P301+P310 - Call doctor']},pl:{contains:'Octan 2-etoksy-1-metyloetylu',hazards:['H226 - Łatwopalna','H304 - Połknięcie grozi śmiercią','H336 - Senność','H412 - Toksyczne dla wody'],precautions:['P210 - Z dala od ciepła','P280 - Rękawice ochronne','P301+P310 - Lekarz']}},
  PLUV_LED:null,
  TPP:{uk:{contains:'Ацетат 2-етокси-1-метилетилу',hazards:['H226 - Легкозаймиста','H304 - Смертельно'],precautions:['P210 - Вогонь','P280 - Захист','P301+P310 - Медична допомога']},en:{contains:'2-ethoxy-1-methylethyl acetate',hazards:['H226 - Flammable','H304 - Fatal if swallowed'],precautions:['P210 - No flames','P280 - Wear gloves','P301+P310 - Doctor']},pl:{contains:'Octan 2-etoksy-1-metyloetylu',hazards:['H226 - Łatwopalna','H304 - Połknięcie grozi śmiercią'],precautions:['P210 - Z dala od ognia','P280 - Ochrona rąk','P301+P310 - Lekarz']}},
  NST:{uk:{contains:'Нітроцелюлоза',hazards:['H228 - Легкозаймисте тверде тіло'],precautions:['P210 - Подалі від вогню','P240 - Заземлення','P405 - Під замком']},en:{contains:'Nitrocellulose',hazards:['H228 - Flammable solid'],precautions:['P210 - Keep away from flame','P240 - Ground container','P405 - Store locked']},pl:{contains:'Nitroceluloza',hazards:['H228 - Łatwopalna substancja stała'],precautions:['P210 - Z dala od ognia','P240 - Uziemić','P405 - Przechowywać zamknięte']}},
  QS:{uk:{contains:'Нітроцелюлоза',hazards:['H228 - Легкозаймисте'],precautions:['P210 - Вогонь','P240 - Заземлення']},en:{contains:'Nitrocellulose',hazards:['H228 - Flammable solid'],precautions:['P210 - Fire','P240 - Ground']},pl:{contains:'Nitroceluloza',hazards:['H228 - Łatwopalna'],precautions:['P210 - Ogień','P240 - Uziemienie']}},
  SN:{uk:{contains:'Нітроцелюлоза',hazards:['H228 - Легкозаймисте'],precautions:['P210 - Вогонь','P405 - Замкнути']},en:{contains:'Nitrocellulose',hazards:['H228 - Flammable solid'],precautions:['P210 - Fire','P405 - Lock up']},pl:{contains:'Nitroceluloza',hazards:['H228 - Łatwopalna'],precautions:['P210 - Ogień','P405 - Przechowywać pod zamknięciem']}},
  SX:{uk:{nonHazardous:true},en:{nonHazardous:true},pl:{nonHazardous:true}},
  SPTN:{uk:{nonHazardous:true},en:{nonHazardous:true},pl:{nonHazardous:true}},
  AS:{uk:{nonHazardous:true},en:{nonHazardous:true},pl:{nonHazardous:true}},
  OTF:{uk:{nonHazardous:true},en:{nonHazardous:true},pl:{nonHazardous:true}}
};
SAFETY.PLUV_LED = SAFETY.PLUV;
