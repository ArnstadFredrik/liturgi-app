import { WIP_TEMPLATES as WIP_MALER } from './wip-maler.js';

export const BUILTIN_TEMPLATES = [
	{
		"id": "hovedgudstjeneste2020",
		kategori: "Hovedgudstjeneste",
		oversettelser: ["ordning-for-hovedgudstjeneste-2020-nynorsk"],
		"alternativer": ["dåp", "nattverd"],
		bibeltekster: [{ "lesning": "L1", "leddId": "o9" }, { "lesning": "L2", "leddId": "o11" }, { "lesning": "E", "leddId": "o12" }],
		"name": "Ordning for hovedgudstjeneste (2020)",
		"description": "Hovedmalen til Den norske kirke – Ordning for hovedgudstjenesten i bokmål, med alle alternativer.",
		"sections": [
			{
				"title": "I. Samling",
				"items": [
					{
						"id": "s1",
						"type": "instruks",
						"heading": "1 Forberedelse",
						"optional": true,
						"text": "@NOTAT Kirkerommet er åpent en stund før gudstjenesten, med anledning til stillhet, lystenning og bønn.\n@NOTAT Klokkeringing\n@NOTAT Her eller etter ledd 3 Hilsen kan det være kort informasjon om dagens gudstjeneste ved medliturg eller liturg. Informasjonen avsluttes med:\n{{r}}ML |{{/r}} La oss være stille for Gud.\n@NOTAT Kort stillhet. Tre klokkeslag.",
						"enabled": true,
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "s2",
						"type": "salme",
						"heading": "* 2 Inngangssalme"
					},
					{
						"id": "s3",
						"type": "tekst",
						"heading": "* 3 Hilsen",
						"instr": "Menigheten står under prosesjon, inngangssalme og hilsen.",
						"alts": [
							{
								"label": "Nåde være med dere og fred",
								"text": "{{r}}L |{{/r}} Nåde være med dere og fred\nfra Gud, vår Far, og Herren Jesus Kristus."
							},
							{
								"label": "Vår Herre Jesu Kristi nåde …",
								"text": "{{r}}L |{{/r}} Vår Herre Jesu Kristi nåde, Guds kjærlighet\nog Den hellige ånds samfunn være med dere alle."
							},
							{
								"label": "I Faderens og Sønnens og Den hellige ånds navn",
								"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den hellige ånds navn."
							},
							{
								"label": "I Faderens og Sønnens og Den hellige ånds navn: Vår skaper …",
								"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den hellige ånds navn:\nVår skaper, frigjører og livgiver."
							}
						],
						"selAlt": 1,
						"text": ""
					},
					{
						"id": "s4",
						"type": "tekst",
						"heading": "4 Samlingsbønn",
						"instr": "Se samlingsbønner og bruken av disse.",
						"alts": [
							{
								"label": "Samlingsbønn 1",
								"text": "{{r}}ML |{{/r}} Gud, vi er kommet inn i ditt hellige hus for å ta imot det du vil gi oss.\nLukk nå opp våre hjerter, så vi kan fornyes i troen på deg."
							},
							{
								"label": "Samlingsbønn 2",
								"text": "{{r}}ML |{{/r}} Hellige Gud, vi er samlet for ditt ansikt for å møte din kjærlighet og sannhet.\nSend oss din Ånd og gjør oss åpne for det du vil gi oss. La ditt ord slå rot i våre hjerter, så Kristus lever i oss, og vi blir ett i deg og tjener deg i alle ting."
							},
							{
								"label": "Samlingsbønn 3",
								"text": "{{r}}ML |{{/r}} Gode Gud, du som gir liv til alt som lever, vi priser deg for jordens skjønnhet,\nog for alt som lar oss kjenne at du er god.\nHer for ditt ansikt ber vi: Gi oss lyttende ører, takknemlige hjerter og tjenende hender, så vi kan høre ditt ord, lovprise deg for din godhet, og i ord og gjerning vitne om dine storverk."
							}
						],
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}ML |{{/r}} La oss be."
							}
						],
						"avslutningAlts": [
							{
								"label": "Avslutning",
								"text": "{{r}}ML |{{/r}} Gud, vi ber.\n{{r}}A |{{/r}} Amen."
							}
						],
						"text": "",
						"selAlt": 0,
						"selIntro": 0,
						"selAvsl": 0
					},
					{
						"id": "s5",
						"type": "tekst",
						"heading": "5 Syndsbekjennelse",
						"optional": true,
						"instr": "Følger her, eller som ledd 17. Liturgen kneler under syndsbekjennelse og stillhet. Også menigheten kan knele.",
						"alts": [
							{
								"label": "a – Gud, vær meg nådig! (full)",
								"text": "{{r}}A |{{/r}} Gud, vær meg nådig!\nJeg har syndet mot deg og sviktet min neste\n– med tanker og ord, med det jeg har gjort, og med det jeg har forsømt.\nTilgi meg min synd for Jesu Kristi skyld. Skap i meg et rent hjerte,\nog gi meg kraft til nytt liv ved din hellige Ånd."
							},
							{
								"label": "b – Gud, vær meg nådig! (kort)",
								"text": "{{r}}A |{{/r}} Gud, vær meg nådig!\nTilgi meg min synd for Jesu Kristi skyld. Skap i meg et rent hjerte,\nog gi meg kraft til nytt liv ved din hellige Ånd."
							},
							{
								"label": "c – Gud, du kjenner og elsker oss alle",
								"text": "{{r}}A |{{/r}} Gud, du kjenner og elsker oss alle. Du vil at vi skal ta vare på hverandre og på jorden.\nVi vet at vi svikter og gjør deg imot. Tilgi oss og hjelp oss, for Jesu skyld."
							},
							{
								"label": "d – Hellige Gud, vår skaper",
								"text": "{{r}}A |{{/r}} Hellige Gud, vår skaper, se i nåde til oss.\nVi har syndet mot deg og brutt dine bud.\nTilgi oss for Jesu Kristi skyld. Sett oss fri til å tjene deg, verne om skaperverket og møte vår neste med kjærlighet."
							},
							{
								"label": "Syndsbekjennelse fra 1977-ordningen",
								"text": "Hellige Gud, himmelske Far, se i nåde til meg, syndige menneske, som har krenket deg med tanker, ord og gjerninger og kjenner lysten til det onde i mitt hjerte.\nFor Jesu Kristi skyld, ha langmodighet med meg.\nTilgi meg alle mine synder, og gi meg å frykte og elske deg alene."
							}
						],
						"introAlts": [
							{
								"label": "La oss bøye oss og bekjenne",
								"text": "{{r}}L |{{/r}} La oss bøye oss for Gud og bekjenne våre synder."
							},
							{
								"label": "La oss bøye oss og be om tilgivelse",
								"text": "{{r}}L |{{/r}} La oss bøye oss for Gud og be om tilgivelse."
							},
							{
								"label": "I tillit og bekjenne",
								"text": "{{r}}L |{{/r}} I tillit til Guds nåde vil vi bekjenne våre synder."
							},
							{
								"label": "I tillit og be om tilgivelse",
								"text": "{{r}}L |{{/r}} I tillit til Guds nåde vil vi be om tilgivelse."
							}
						],
						"avslutningAlts": [
							{
								"label": "Løftesord 1 Joh 1,9",
								"text": "{{r}}L |{{/r}} Guds ord sier: Dersom vi bekjenner våre synder, er han trofast og rettferdig, så han tilgir oss syndene og renser oss for all urett.\nBIBELREF | 1 Joh 1,9"
							},
							{
								"label": "Løftesord Sal 103,11-12",
								"text": "{{r}}L |{{/r}} Så høy som himmelen er over jorden, så veldig er hans miskunn over dem som frykter ham. Så langt som øst er fra vest, tar han syndene våre bort fra oss.\nBIBELREF | Sal 103,11-12"
							}
						],
						"text": "",
						"selAlt": 0,
						"selIntro": 0,
						"selAvsl": 0
					},
					{
						"id": "s6",
						"type": "tekst",
						"heading": "6–7 Bønnerop KYRIE og lovsang GLORIA",
						"instr": "Gloria kan utelates i fastetiden. Musikken hentes fra Den norske kirkes fem godkjente serier.",
						"alts": [
							{
								"label": "Allmenn serie 1",
								"text": "{{r}}A |{{/r}} Kyrie eleison. Gud Fader, miskunne deg. Kriste eleison. Herre Krist, miskunne deg. Kyrie eleison. Hellig Ånd, miskunne deg.\n{{r}}L/ML |{{/r}} Ære være Gud i det høyeste\n{{r}}A |{{/r}} og fred på jorden blant mennesker som Gud har glede i. Vi lover deg, vi priser deg, vi tilber deg, vi opphøyer deg. Amen."
							},
							{
								"label": "Allmenn serie 2",
								"text": "{{r}}A |{{/r}} Kyrie eleison. Miskunne deg over oss.\nKriste eleison. Miskunne deg over oss. Kyrie eleison. Miskunne deg over oss.\n{{r}}L/ML |{{/r}} Ære være Gud i det høyeste\n{{r}}A |{{/r}} og fred på jorden blant mennesker som Gud har glede i. Vi lover deg, vi priser deg, vi tilber deg, vi opphøyer deg. Amen."
							},
							{
								"label": "Allmenn serie 3",
								"text": "{{r}}ML |{{/r}} Herre, miskunne deg. M | Herre, miskunne deg. ML | Kristus, miskunne deg. M | Kristus, miskunne deg. ML | Herre, miskunne deg. M | Herre, miskunne deg.\n{{r}}L/ML |{{/r}} Ære være Gud i det høyeste.\n{{r}}M |{{/r}} Ære være Gud i det høyeste.\n{{r}}ML |{{/r}} Herre, vi lover, Herre, vi priser deg.\n{{r}}M |{{/r}} Ære være Gud i det høyeste. Amen."
							},
							{
								"label": "Serie for festtidene",
								"text": "{{r}}ML |{{/r}} Kyrie eleison. M | Kyrie eleison. ML | Kriste eleison. M | Kriste eleison. ML | Kyrie eleison. M | Kyrie eleison.\n{{r}}L/ML |{{/r}} Ære være Gud i det høyeste\n{{r}}A |{{/r}} og fred på jorden blant mennesker som Gud har glede i. Vi lover deg, vi priser deg, vi tilber deg, vi opphøyer deg. Amen."
							},
							{
								"label": "Serie for fastetiden (uten gloria)",
								"text": "{{r}}A |{{/r}} Kyrie eleison. Herre, miskunne deg.\nKriste eleison. Kristus, miskunne deg. Kyrie eleison. Herre, miskunne deg."
							}
						],
						"text": "",
						"selAlt": 0
					},
					{
						"id": "s8",
						"type": "tekst",
						"heading": "8 Dagens bønn",
						"optional": true,
						"instr": "Bønnen kan utelates. Bønnen synges eller fremsies.",
						"text": "{{r}}L |{{/r}} La oss alle be.\n[Dagens bønn]\n{{r}}M |{{/r}} Amen.",
						"alts": [],
						"selAlt": 0
					}
				]
			},
			{
				"title": "Dåp",
				"items": [],
				"alternativer": ["dåp"],
				"__lenket": true
			},
			{
				"title": "II. Ordet",
				"items": [
					{
						"id": "o0",
						"type": "instruks",
						"heading": "Inngang til Ordet",
						"optional": true,
						"text": "I andre hovedgudstjenester enn høymessen kan det være to lesninger, eller én lesning (evangeliet). Menigheten står under evangelielesningen og sitter under de øvrige lesningene.\n{{r}}L/ML |{{/r}} La oss høre Herrens ord.",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "o9",
						"type": "lesning",
						"heading": "9 Første lesning",
						"label": "Fra Det gamle testamentet",
						"introAlts": [
							{
								"label": "Innledning",
								"text": "[Lesningstekst]"
							},
							{
								"label": "Innledning",
								"text": "{{r}}ML |{{/r}} Det står skrevet i …"
							}
						],
						"avslutningAlts": [
							{
								"label": "Avslutning",
								"text": "{{r}}ML |{{/r}} Slik lyder Herrens ord."
							}
						],
						"selIntro": 0,
						"selAvsl": 0,
						"text": "",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "o10",
						"type": "salme",
						"heading": "10 Bibelsk salme / Salme",
						"optional": true
					},
					{
						"id": "o11",
						"type": "lesning",
						"heading": "11 Andre lesning",
						"optional": true,
						"label": "Fra Det nye testamentet utenom evangeliene",
						"introAlts": [
							{
								"label": "Innledning",
								"text": "[Lesningstekst]"
							},
							{
								"label": "Innledning",
								"text": "{{r}}ML |{{/r}} Det står skrevet i …"
							}
						],
						"avslutningAlts": [
							{
								"label": "Avslutning",
								"text": "{{r}}ML |{{/r}} Slik lyder Herrens ord."
							}
						],
						"selIntro": 0,
						"selAvsl": 0,
						"text": "",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "o12",
						"type": "lesning",
						"heading": "* 12 Evangelium",
						"instr": "Innledes med hallelujaomkved eller salmevers med hallelujaomkved (N13: 977.1-7). I fastetiden erstattes halleluja av tractus, f.eks. N13: 926, 927, 928, 932, 939.",
						"introAlts": [
							{
								"label": "Innledning",
								"text": "[Evangelietekst]"
							},
							{
								"label": "Innledning",
								"text": "{{r}}L |{{/r}} Det står skrevet i evangeliet etter …"
							}
						],
						"avslutningAlts": [
							{
								"label": "Avslutning",
								"text": "{{r}}L |{{/r}} Slik lyder det hellige evangelium."
							}
						],
						"selIntro": 0,
						"selAvsl": 0,
						"text": "",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "o12a",
						"type": "salme",
						"heading": "Hallelujaomkved / tractus"
					},
					{
						"id": "o13",
						"type": "preken",
						"heading": "13 Preken",
						"instr": "Predikanten preker over evangelieteksten eller annen oppsatt prekentekst. Etter prekenen kan det gis tid til stillhet, en kort salme eller meditativ musikk.",
						"avslutningAlts": [
							{
								"label": "Lovprisning (full form)",
								"text": "{{r}}L |{{/r}} Ære være Faderen og Sønnen og Den hellige ånd,\nsom var og er og blir én sann Gud fra evighet og til evighet."
							},
							{
								"label": "Lovprisning (kort form)",
								"text": "{{r}}L |{{/r}} Ære være Faderen og Sønnen og Den hellige ånd: Vår skaper, frigjører og livgiver."
							}
						],
						"text": "",
						"alts": [],
						"selAlt": 0,
						"selAvsl": 0
					},
					{
						"id": "o14",
						"type": "tekst",
						"heading": "* 14 Trosbekjennelse CREDO",
						"instr": "Innledes med ML/L | La oss bekjenne vår hellige tro. Kan utelates ved dåp.",
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}ML/L |{{/r}} La oss bekjenne vår hellige tro"
							}
						],
						"selIntro": 0,
						"alts": [
							{
								"label": "Den apostoliske trosbekjennelse",
								"text": "{{r}}A |{{/r}} Jeg tror på Gud Fader, den allmektige, himmelens og jordens skaper.\nJeg tror på Jesus Kristus,\nGuds enbårne Sønn, vår Herre,\nsom ble unnfanget ved Den hellige ånd, født av jomfru Maria,\npint under Pontius Pilatus, korsfestet, død og begravet, fór ned til dødsriket,\nstod opp fra de døde tredje dag, fór opp til himmelen,\nsitter ved Guds, den allmektige Faders høyre hånd, skal derfra komme igjen\nfor å dømme levende og døde.\nJeg tror på Den hellige ånd, en hellig, allmenn kirke, de helliges samfunn, syndenes forlatelse, legemets oppstandelse\nog det evige liv.\nAmen."
							},
							{
								"label": "Den nikenske trosbekjennelse",
								"text": "{{r}}A |{{/r}} Vi tror på én Gud, den allmektige Far,\nsom har skapt himmel og jord, alt synlig og usynlig.\nVi tror på én Herre, Jesus Kristus, Guds enbårne Sønn,\nfødt av Faderen før alle tider, Gud av Gud, lys av lys,\nsann Gud av sann Gud, født, ikke skapt,\nav samme vesen som Faderen. Ved ham er alt blitt skapt.\nFor oss mennesker og til vår frelse steg han ned fra himmelen,\nog ved Den hellige ånd og av jomfru Maria ble han menneske av kjøtt og blod.\nHan ble korsfestet for oss under Pontius Pilatus, led og ble begravet,\noppstod den tredje dag etter Skriftene og fór opp til himmelen,\nsitter ved Faderens høyre hånd, skal komme igjen i herlighet for å dømme levende og døde, og hans rike skal være uten ende.\nVi tror på Den hellige ånd, som er Herre og gjør levende,\nsom utgår fra Faderen og Sønnen,\ntilbes og æres sammen med Faderen og Sønnen, og som har talt gjennom profetene.\nVi tror på én hellig, allmenn og apostolisk kirke.\nVi bekjenner én dåp til syndenes forlatelse og venter de dødes oppstandelse\nog et liv i den kommende verden. Amen."
							}
						],
						"text": "",
						"selAlt": 0
					},
					{
						"id": "o15",
						"type": "salme",
						"heading": "15 Salme",
						"optional": true,
						"instr": "Salmen kan falle bort dersom trosbekjennelsen synges. Kan alternativt synges mellom Preken og Trosbekjennelse."
					},
					{
						"id": "o16",
						"type": "kunngjoring",
						"heading": "16 Kunngjøringer",
						"optional": true,
						"enabled": false,
						"text": "",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "o17",
						"type": "tekst",
						"heading": "17 Syndsbekjennelse (etter ordet)",
						"optional": true,
						"instr": "Følger her, eller som ledd 5. Før innledningsordet kan liturgen si budordene (Matt 22,37-39).",
						"alts": [
							{
								"label": "a – Gud, vær meg nådig! (full)",
								"text": "{{r}}A |{{/r}} Gud, vær meg nådig!\nJeg har syndet mot deg og sviktet min neste\n– med tanker og ord, med det jeg har gjort, og med det jeg har forsømt.\nTilgi meg min synd for Jesu Kristi skyld. Skap i meg et rent hjerte,\nog gi meg kraft til nytt liv ved din hellige Ånd."
							},
							{
								"label": "b – Gud, vær meg nådig! (kort)",
								"text": "{{r}}A |{{/r}} Gud, vær meg nådig!\nTilgi meg min synd for Jesu Kristi skyld. Skap i meg et rent hjerte,\nog gi meg kraft til nytt liv ved din hellige Ånd."
							},
							{
								"label": "c – Gud, du kjenner og elsker oss alle",
								"text": "{{r}}A |{{/r}} Gud, du kjenner og elsker oss alle. Du vil at vi skal ta vare på hverandre og på jorden.\nVi vet at vi svikter og gjør deg imot. Tilgi oss og hjelp oss, for Jesu skyld."
							},
							{
								"label": "d – Hellige Gud, vår skaper",
								"text": "{{r}}A |{{/r}} Hellige Gud, vår skaper, se i nåde til oss.\nVi har syndet mot deg og brutt dine bud.\nTilgi oss for Jesu Kristi skyld. Sett oss fri til å tjene deg, verne om skaperverket og møte vår neste med kjærlighet."
							},
							{
								"label": "Syndsbekjennelse fra 1977-ordningen",
								"text": "Hellige Gud, himmelske Far, se i nåde til meg, syndige menneske, som har krenket deg med tanker, ord og gjerninger og kjenner lysten til det onde i mitt hjerte.\nFor Jesu Kristi skyld, ha langmodighet med meg.\nTilgi meg alle mine synder og gi meg å frykte og elske deg alene."
							}
						],
						"introAlts": [
							{
								"label": "Budord (Matt 22,37-39)",
								"text": "{{r}}L |{{/r}} Vår Herre Jesus Kristus sier: Du skal elske Herren din Gud av hele ditt hjerte og av hele din sjel og av all din forstand. Dette er det største og første budet. Men det andre er like stort: Du skal elske din neste som deg selv.\nBIBELREF | Matt 22,37-39"
							},
							{
								"label": "La oss bøye oss og bekjenne",
								"text": "{{r}}L |{{/r}} La oss bøye oss for Gud og bekjenne våre synder."
							},
							{
								"label": "La oss bøye oss og be om tilgivelse",
								"text": "{{r}}L |{{/r}} La oss bøye oss for Gud og be om tilgivelse."
							},
							{
								"label": "I tillit og bekjenne",
								"text": "{{r}}L |{{/r}} I tillit til Guds nåde vil vi bekjenne våre synder."
							},
							{
								"label": "I tillit og be om tilgivelse",
								"text": "{{r}}L |{{/r}} I tillit til Guds nåde vil vi be om tilgivelse."
							}
						],
						"avslutningAlts": [
							{
								"label": "Løftesord 1 Joh 1,9",
								"text": "{{r}}L |{{/r}} Guds ord sier: Dersom vi bekjenner våre synder, er han trofast og rettferdig, så han tilgir oss syndene og renser oss for all urett.\nBIBELREF | 1 Joh 1,9"
							},
							{
								"label": "Løftesord Sal 103,11-12",
								"text": "{{r}}L |{{/r}} Så høy som himmelen er over jorden, så veldig er hans miskunn over dem som frykter ham. Så langt som øst er fra vest, tar han syndene våre bort fra oss.\nBIBELREF | Sal 103,11-12"
							}
						],
						"text": "",
						"selAlt": 0,
						"selIntro": 0,
						"selAvsl": 0
					},
					{
						"id": "o18",
						"type": "tekst",
						"heading": "18 Forbønn for kirken og verden",
						"instr": "Forbønnen ledes fortrinnsvis av en medliturg. Temaområder: Jordens folk og nasjoner / Vårt land og folk / Den verdensvide kirke / Vår menighet, familier og bosted / Aktuelle hendelser. Hvert avsnitt avsluttes med bønskeropet, og menighetssvaret gjentas. Etter siste avsnitt synger alle Amen. Etter siste bønneavsnitt synger alle Amen. Her kan ev. følge Fadervår.",
						"alts": [
							{
								"label": "Menighetssvar: Herre, hør vår bønn.",
								"text": "{{r}}M |{{/r}} Herre, hør vår bønn."
							},
							{
								"label": "Menighetssvar: Hør vår bønn. La ditt rike komme …",
								"text": "{{r}}M |{{/r}} Hør vår bønn. Hør vår bønn. La ditt rike komme, la din vilje skje, Gud! Hør vår bønn."
							},
							{
								"label": "Menighetssvar: Herre, hør vår bønn. (sunget serie 3)",
								"text": "{{r}}M |{{/r}} Herre, hør vår bønn."
							},
							{
								"label": "Menighetssvar: Herre, vår Gud, hør oss når vi ber.",
								"text": "{{r}}M |{{/r}} Herre, vår Gud, hør oss når vi ber."
							}
						],
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}ML/L |{{/r}} La oss be for kirken og verden."
							}
						],
						"avslutningAlts": [
							{
								"label": "Minnedel — Sal 90,12",
								"text": "{{r}}ML/L |{{/r}} Vi reiser oss og minnes dem i vår menighet det er holdt gravferd for siden sist vi var samlet.\nMenigheten reiser seg. Navnene til de avdøde leses opp. Kort stillhet.\n{{r}}ML/L |{{/r}} Lær oss å telle våre dager så vi kan få visdom i hjertet! Sal 90,12\n\nDeretter kan denne eller en lignende bønn bes:\n{{r}}ML/L |{{/r}} Barmhjertige Gud, trøst de sørgende og vær dem nær i tiden som kommer."
							},
							{
								"label": "Minnedel — Joh 11,25",
								"text": "{{r}}ML/L |{{/r}} Vi reiser oss og minnes dem i vår menighet det er holdt gravferd for siden sist vi var samlet.\nMenigheten reiser seg. Navnene til de avdøde leses opp. Kort stillhet.\n{{r}}ML/L |{{/r}} Jesus sier: «Jeg er oppstandelsen og livet. Den som tror på meg, skal leve om han enn dør.» Joh 11,25\n\nDeretter kan denne eller en lignende bønn bes:\n{{r}}ML/L |{{/r}} Barmhjertige Gud, trøst de sørgende og vær dem nær i tiden som kommer."
							},
							{
								"label": "Minnedel — N13 872,5",
								"text": "{{r}}ML/L |{{/r}} Vi reiser oss og minnes dem i vår menighet det er holdt gravferd for siden sist vi var samlet.\nMenigheten reiser seg. Navnene til de avdøde leses opp. Kort stillhet.\n{{r}}ML/L |{{/r}} Nå er livet gjemt hos Gud. Vi overgir alt til ham. Håpet er tent i liv og død. Ingen er glemt av Gud. (N13: 872,5)\n\nDeretter kan denne eller en lignende bønn bes:\n{{r}}ML/L |{{/r}} Barmhjertige Gud, trøst de sørgende og vær dem nær i tiden som kommer."
							}
						],
						"text": "",
						"selAlt": 0,
						"selIntro": 0,
						"selAvsl": 0
					},
					{
						"id": "o18b",
						"type": "tekst",
						"heading": "Vi minnes de døde og ber for de sørgende",
						"optional": true,
						"instr": "Forbønnen kan avsluttes med at menigheten minnes dem som er døde, og som det er holdt gravferd for siden sist. Menigheten reiser seg. Navnene leses opp. Kort stillhet.",
						"text": "{{r}}ML/L |{{/r}} Vi reiser oss og minnes dem i vår menighet det er holdt gravferd for siden sist vi var samlet.\n[Navn]\n{{r}}ML/L |{{/r}} Lær oss å telle våre dager så vi kan få visdom i hjertet! (Sal 90,12)\n{{r}}ML/L |{{/r}} Barmhjertige Gud, trøst de sørgende og vær dem nær i tiden som kommer.",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "o19",
						"type": "tekst",
						"heading": "19 Takkoffer",
						"instr": "Kan samles inn her, under ledd 20 eller under ledd 27.",
						"text": "{{r}}L |{{/r}} Evige Gud, din er jorden og det som fyller den. Alt vi eier tilhører deg. Av ditt eget gir vi deg tilbake.\nA/L | Ta imot oss og våre gaver i Jesu navn. Amen.",
						"enabled": false,
						"alts": [],
						"selAlt": 0
					}
				]
			},
			{
				"title": "III. Nattverd",
				"alternativer": ["nattverd"],
				"items": [
					{
						"id": "n20",
						"type": "salme",
						"heading": "20 Forberedelse av måltidet – Nattverdsalme",
						"instr": "Bordet dekkes. Brød legges på disken og vin helles i begeret. Takkofferet kan samles inn her. Ofringen avsluttes med: L | Velsignet er du, Gud. Din er jorden og alt som fyller den. … Ta imot oss og våre gaver i Jesu navn. Amen."
					},
					{
						"id": "nattverd-prefasjonsdialog",
						"type": "tekst",
						"heading": "Prefasjonsdialog",
						"optional": false,
						"text": "{{r}}L |{{/r}} synger eller sier: Herren være med dere.\n{{r}}M |{{/r}} reiser seg og synger: Og med deg være Herren.\n{{r}}L |{{/r}} Løft deres hjerter.\n{{r}}M |{{/r}} Vi løfter våre hjerter til Herren.\n{{r}}L |{{/r}} La oss takke Herren vår Gud.\n{{r}}M |{{/r}} Det er verdig og rett.",
						"alts": [],
						"selAlt": null
					},
					{
						"id": "nattverd-prefasjon",
						"type": "tekst",
						"heading": "* 21 Prefasjon",
						"optional": true,
						"text": "",
						"alts": [
							{
								"label": "Advent",
								"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som du sendte til frelse for verden for å oppfylle de løfter du gav ditt folk gjennom profetene. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
							},
							{
								"label": "Jul og Maria budskapsdag",
								"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som for vår skyld ble menneske for at vi skulle bli dine barn, frelst ut av mørket og inn i ditt underfulle lys. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
							},
							{
								"label": "Åpenbaringstiden",
								"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som åpenbarte din herlighet for verden, så den som følger ham ikke skal vandre i mørket, men ha lys og evig liv. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
							},
							{
								"label": "Faste",
								"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som elsket oss og gav seg selv for oss, så han ble lydig til døden, ja døden på korset. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
							},
							{
								"label": "Påske",
								"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre. Han er det rette påskelam, som har båret våre synder, og ved sin oppstandelse har han seiret over døden. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
							},
							{
								"label": "Kristi himmelfartsdag og søndag før pinse",
								"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som fór opp til himmelen og nå sitter ved din høyre hånd. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
							},
							{
								"label": "Pinse",
								"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som troner ved din høyre hånd og har sendt Den hellige ånd over sine vitner, så ditt folk kan juble av glede og forkynne dine store gjerninger på mange tungemål. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
							},
							{
								"label": "Treenighetstiden 1",
								"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som du sendte til frelse for verden, for at vi ved hans død skulle få tilgivelse for syndene og ved hans oppstandelse vinne det evige liv. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
							},
							{
								"label": "Treenighetstiden 2",
								"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre. Han er det levende brød som kommer ned fra himmelen og gir verden liv, så den som kommer til ham, ikke skal hungre, og den som tror på ham, aldri skal tørste. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
							},
							{
								"label": "Treenighetstiden 3",
								"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som kom til oss med himlenes rike og forkynte det glade budskap, så syndere får sitte til bords i ditt rike. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
							},
							{
								"label": "Treenighetstiden 4",
								"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som gjorde oss til sine disipler og lovte å være med oss alle dager inntil verdens ende. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
							},
							{
								"label": "Allehelgensdag, martyrdager",
								"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som var frelser og forbilde for alle dine hellige som har fullført løpet og bevart troen. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
							},
							{
								"label": "Nattverdbønn a (omarbeidet fra høymessen 1977)",
								"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som du sendte til frelse for verden, for at vi ved hans død skulle få tilgivelse for syndene og ved hans oppstandelse vinne det evige liv. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
							},
							{
								"label": "Nattverdbønn b (etter Hippolyt, 200-tallet)",
								"text": "Vi takker deg, Gud, ved din elskede Sønn Jesus Kristus. Han er det evige Ord, og ved dette Ord skapte du alt. Da tiden var inne, sendte du ham til verden som frelser og befrier. For dette priser vi deg, sammen med alle dine hellige i himmelen og på jorden:"
							},
							{
								"label": "Nattverdbønn c (paulinske tekster)",
								"text": "Å, dyp av rikdom og visdom og kunnskap hos deg, Gud! Himlene forteller om din herlighet, og jorden vitner om dine henders verk. Sammen med de troende gjennom alle tider vil vi prise ditt hellige navn:"
							},
							{
								"label": "Nattverdbønn d (Emmausfortellingen, Luk 24)",
								"text": "Vi priser deg, evige Gud, du som har skapt verden og alt som er i den. Det er i deg vi lever, beveger oss og er til. Sammen med din menighet i himmelen og på jorden lovsynger vi ditt hellige navn:"
							},
							{
								"label": "Nattverdbønn e (bearbeidet etter familiemessen 2003)",
								"text": "Vi takker deg, gode Gud, du som holder himmel og jord i dine hender. Du har skapt oss i ditt bilde og gitt oss livet i gave. Sammen med englene og din menighet i himmelen og på jorden lovsynger vi ditt hellige navn:"
							},
							{
								"label": "Nattverdbønn f (kort – ved særskilte anledninger)",
								"text": "Gode Gud, du har skapt oss og kalt oss ved navn. Du åpner din hånd og metter alt som lever med det gode. Sammen med din menighet i himmelen og på jorden lovsynger vi ditt hellige navn:"
							},
							{
								"label": "Nattverdbønn g (Gudstjenesteboken 1992, Johannesordningen)",
								"text": "Evige, allmektige Gud, du holder himmel og jord i dine hender, du nevner oss alle ved navn, så vi skal tilhøre deg og være ditt folk på jorden. Sammen med de troende gjennom alle tider og med de himmelske hærskarer vil vi prise ditt hellige navn:"
							}
						],
						"selAlt": 0
					},
					{
						"id": "nattverd-sanctus",
						"type": "tekst",
						"heading": "Sanctus",
						"optional": false,
						"text": "",
						"alts": [
							{
								"label": "Allmenn serie 1, 2, fest- og fasteserien",
								"text": "{{r}}A |{{/r}} synger: Hellig, hellig, hellig, er Herren Sebaot. All jorden er full\nav din herlighet. Hosianna i det høyeste. Velsignet være han som kommer i Herrens navn. Hosianna i det høyeste."
							},
							{
								"label": "Allmenn serie 3",
								"text": "ML og A synger\n{{r}}ML |{{/r}} Hellig, hellig, hellig er Herren vår Gud.\n{{r}}A |{{/r}} Omkved: Hellig, hellig, hellig er Herren vår Gud.\n{{r}}ML |{{/r}} Du er Herre over himmel og jord.\n{{r}}A |{{/r}} Omkved\n{{r}}ML |{{/r}} Du er herlig og mektig og stor.\n{{r}}A |{{/r}} Omkved\n{{r}}ML |{{/r}} Du har sendt oss Jesus Kristus, din Sønn.\n{{r}}A |{{/r}} Omkved\n{{r}}ML |{{/r}} Velsignet han som kommer i Herrens navn.\n{{r}}A |{{/r}} Omkved"
							}
						],
						"selAlt": 0
					},
					{
						"id": "nattverd-epiklese",
						"type": "tekst",
						"heading": "Epiklese",
						"optional": true,
						"text": "",
						"alts": [
							{
								"label": "Nattverdbønn a (omarbeidet fra høymessen 1977)",
								"text": "Vi priser deg, hellige Gud, himmelens og jordens Skaper, du som har elsket verden og gitt din Sønn, Jesus Kristus, for at han skulle frelse oss fra synd og død og vinne deg et hellig folk.\n{{r}}L |{{/r}} Vi ber deg: Send din Ånd over disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen."
							},
							{
								"label": "Nattverdbønn b (etter Hippolyt, 200-tallet)",
								"text": "Vi priser deg Gud for Jesus Kristus, din tjener. Han kom fra himmelen, og ved Den hellige ånd og jomfru Maria ble han menneske av kjøtt og blod. Han oppfylte din vilje da han strakte ut sine hender på korsets tre. Slik tilintetgjorde han døden, brøt ondskapens lenker og åpenbarte oppstandelsen fra de døde. Derfor minnes vi hans død og oppstandelse når vi bærer brødet og vinen fram for deg.\n{{r}}L |{{/r}} Vi ber deg: Send din hellige Ånd over disse gaver, så de for oss blir livets brød og frelsens beger."
							},
							{
								"label": "Nattverdbønn c (paulinske tekster)",
								"text": "Hellig og barmhjertig er du, Gud, som ikke vendte deg bort da mennesket syndet, men gav løfte til Abraham om velsignelse for alle folkeslag. Mektig og trofast er du, som befridde ditt folk fra trelldom, og fornyet løftene gjennom profetene.\nDa tiden var inne, sendte du din Sønn, født av Maria, for å kjøpe oss fri og gi oss retten til å være dine barn.\nVed hans død på korset forsonte du alt med deg selv og skapte fred, og ved hans oppstandelse ble døden overvunnet.\n{{r}}L |{{/r}} Vi ber deg: Send din Ånd over disse dine gaver. Foren oss i troen på din nåde, så vi kan ta imot Jesu legeme og blod til forsoning og fred, og forkynne hans død til han kommer."
							},
							{
								"label": "Nattverdbønn d (Emmausfortellingen, Luk 24)",
								"text": "Vi takker deg, all godhets kilde. Du sendte din Sønn. Han ble korsfestet og stod opp fra de døde. Han åpnet skriftene og åpenbarte seg for sine venner da han brøt brødet og gav dem.\n{{r}}L |{{/r}} Nå ber vi deg: La din hellige Ånd komme over brødet og vinen, så våre øyne åpnes, og vi kjenner ham igjen som vår korsfestede og oppstandne Frelser."
							},
							{
								"label": "Nattverdbønn e (bearbeidet etter familiemessen 2003)",
								"text": "Hellige Gud, vi takker deg for Jesus Kristus, verdens frelser. Han døde og stod opp igjen for å gi oss evig liv. Vi takker deg for dåpens gave, der vi blir født på ny, og for nattverden, der du samler oss som din store familie.\n{{r}}L |{{/r}} Vi ber deg: Send din hellige Ånd over brødet og vinen. Gjør oss til ett med hverandre og med Jesus Kristus."
							},
							{
								"label": "Nattverdbønn f (kort – ved særskilte anledninger)",
								"text": "Vi takker deg for Jesus Kristus, vår frelser. Han er det levende brød som kommer ned fra himmelen og gir verden liv.\n{{r}}L |{{/r}} Vi ber deg: Send din Ånd over oss og disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen."
							},
							{
								"label": "Nattverdbønn g (Gudstjenesteboken 1992, Johannesordningen)",
								"text": "Hellige Gud, uten ende er din miskunn, og evig er ditt herredømme. Du har fylt ditt skaperverk med lys og liv; himmelen og jorden er fulle av din herlighet. Gjennom Abraham lovte du å velsigne alle folkeslag. Du berget Israel, ditt utvalgte folk. Gjennom profetene fornyet du ditt løfte. Og da tiden var kommet, sendte du din Sønn, han som i ord og gjerning forkynte ditt rike og var lydig mot din vilje helt til døden.\n{{r}}L |{{/r}} Vi ber deg: Send din Ånd over disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen."
							}
						],
						"selAlt": 0
					},
					{
						"id": "nattverd-verba",
						"type": "tekst",
						"heading": "Innstiftelsesordene VERBA",
						"optional": true,
						"text": "",
						"alts": [
							{
								"label": "Nattverdbønn a (omarbeidet fra høymessen 1977)",
								"text": "Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg."
							},
							{
								"label": "Nattverdbønn b (etter Hippolyt, 200-tallet)",
								"text": "Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg."
							},
							{
								"label": "Nattverdbønn c (paulinske tekster)",
								"text": "Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg."
							},
							{
								"label": "Nattverdbønn d (Emmausfortellingen, Luk 24)",
								"text": "Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg."
							},
							{
								"label": "Nattverdbønn e (bearbeidet etter familiemessen 2003)",
								"text": "Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg."
							},
							{
								"label": "Nattverdbønn f (kort – ved særskilte anledninger)",
								"text": "Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg."
							},
							{
								"label": "Nattverdbønn g (Gudstjenesteboken 1992, Johannesordningen)",
								"text": "Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\n{{r}}L/ML |{{/r}} Derfor, så ofte som vi spiser dette brødet og drikker av begeret, forkynner vi Herrens død, inntil han kommer."
							}
						],
						"selAlt": 0
					},
					{
						"id": "nattverd-troens-mysterium",
						"type": "tekst",
						"heading": "Troens mysterium",
						"optional": false,
						"text": "{{r}}L |{{/r}} Stort er troens mysterium.\n{{r}}A |{{/r}} Kristus døde. Kristus stod opp. Kristus skal komme igjen. Ham være ære for kjærligheten som er sterkere enn døden.",
						"instr": "Synges eller fremsies.",
						"alts": [],
						"selAlt": null
					},
					{
						"id": "nattverd-avslutning",
						"type": "tekst",
						"heading": "Avslutning",
						"optional": true,
						"text": "",
						"alts": [
							{
								"label": "Nattverdbønn a (omarbeidet fra høymessen 1977)",
								"text": "Nådige Gud, vi feirer dette måltidet med glede og takk for din Sønns fullbrakte offer, i troen på hans seierrike oppstandelse og himmelfart og i forventning om hans gjenkomst i herlighet. Vi ber deg: Fyll oss med din Ånd og kjærlighet, så vi kan gjenkjenne Kristus i den som sulter og tørster. Lær oss å elske hverandre som han har elsket oss, og la oss en gang samles hos deg i ditt fullendte rike."
							},
							{
								"label": "Nattverdbønn b (etter Hippolyt, 200-tallet)",
								"text": "La alle som får del i brødet og vinen, forenes til ett. Fyll oss med din hellige Ånd og grunnfest oss i sannheten, så vi kan prise deg i din hellige kirke nå og i all evighet."
							},
							{
								"label": "Nattverdbønn c (paulinske tekster)",
								"text": "Evige Gud, forny oss ved din Ånd. Sammen med alt som er skapt, venter vi med lengsel på å bli frigjort fra forgjengelighet og få del i den frihet som dine barn skal eie i herligheten. Fra deg og ved deg og til deg er alle ting. Deg være ære i all evighet!"
							},
							{
								"label": "Nattverdbønn d (Emmausfortellingen, Luk 24)",
								"text": "Hellige Gud, fyll oss med din Ånd. Gi oss brennende hjerter, så vi i undring og glede tar vare på ditt ord og viser barmhjertighet mot den som lider. Bli hos oss, også når vi tviler og sørger. Gå med oss, inntil savn og smerte har veket for evig jubel og lovsang."
							},
							{
								"label": "Nattverdbønn e (bearbeidet etter familiemessen 2003)",
								"text": "Gud, fyll oss med din Ånd. Ta oss alle i favn, slik en kjærlig mor samler barna sine om seg. La de små bli opphøyet og de sultne bli mettet med gode gaver.\nLiturgen og/eller ett eller flere barn synger eller sier: Sammen med alle dine barn ber vi den bønn som din Sønn har lært oss:"
							},
							{
								"label": "Nattverdbønn f (kort – ved særskilte anledninger)",
								"text": "Sammen med alle dine barn ber vi den bønn som din Sønn har lært oss:"
							},
							{
								"label": "Nattverdbønn g (Gudstjenesteboken 1992, Johannesordningen)",
								"text": "Derfor, barmhjertige Far, vil vi med dette brødet og dette begeret komme i hu at Herren gav sitt liv for oss. Og i troen på hans oppstandelse venter vi på at han kommer igjen i makt og herlighet og vil holde sitt store gjestebud sammen med sitt folk.\n{{r}}A |{{/r}} Amen, ja, kom, Herre Jesus.\n{{r}}L |{{/r}} Vi ber deg, allmektige Gud, gi oss din hellige Ånd. La oss kjenne kraften av Kristi oppstandelse, så vi som tar imot hans legeme og blod, kan leve til pris og ære for din herlighet og få del i den arven som de hellige får i lyset.\n{{r}}A |{{/r}} Amen, ja, kom, du Hellige Ånd.\n{{r}}L/ML |{{/r}} Foren vår bønn med bønnene fra dine tjenere alle steder og gjennom alle tider, og med forbønnen fra vår store øversteprest, som alltid ber for oss, inntil han kommer med seier, som Herren over alle ting. Ved ham og i ham og i samfunn med Den hellige ånd skal du ha all herlighet og ære, allmektige Far, evige Gud, nå og til evig tid."
							}
						],
						"selAlt": 0
					},
					{
						"id": "n21b",
						"type": "tekst",
						"heading": "Fadervår",
						"instr": "Fremsies eller synges (N13: 984.1 og 3, 985.1 og 3). Kan erstattes av Fadervår etter 1977- eller 1920-liturgiene.",
						"text": "{{r}}A |{{/r}} Vår Far i himmelen! La navnet ditt helliges. La riket ditt komme.\nLa viljen din skje på jorden slik som i himmelen. Gi oss i dag vårt daglige brød,\nog tilgi oss vår skyld, slik også vi tilgir våre skyldnere. Og la oss ikke komme i fristelse, men frels oss fra det onde.\nFor riket er ditt og makten og æren i evighet. Amen.",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "n22a",
						"type": "tekst",
						"heading": "* 22 Fredshilsen PAX",
						"instr": "Menigheten står helt til de første går fram til nattverd. Her kan en føye til: L/ML | La oss hilse hverandre med et tegn på fred. Menigheten hilser hverandre med håndtrykk.",
						"text": "{{r}}L |{{/r}} Guds fred være med dere.\n{{r}}M |{{/r}} Guds fred være med deg.",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "n22b",
						"type": "tekst",
						"heading": "Du Guds Lam AGNUS DEI",
						"alts": [
							{
								"label": "Allmenn serie 1, 2, fest- og fasteserien",
								"text": "{{r}}A |{{/r}} Du Guds Lam, som bærer verdens synder, miskunne deg over oss.\nDu Guds Lam, som bærer verdens synder, miskunne deg over oss.\nDu Guds Lam, som bærer verdens synder, gi oss din fred."
							},
							{
								"label": "Allmenn serie 3",
								"text": "{{r}}ML |{{/r}} Amen, kom, Herre Jesus. A | Omkved: Amen, kom, Herre Jesus.\n{{r}}ML |{{/r}} Du er Lammet som bærer vår synd. A | Omkved\n{{r}}ML |{{/r}} Du er Lammet som gir oss din fred. A | Omkved\n{{r}}ML |{{/r}} Du er brødet som gir oss ditt liv. A | Omkved"
							}
						],
						"text": "",
						"selAlt": 0
					},
					{
						"id": "n22c",
						"type": "tekst",
						"heading": "Invitasjon og utdeling",
						"instr": "{{r}}L |{{/r}} Kom, for alt er gjort ferdig. (Kan alternativt gis før Du Guds Lam synges.) Utdelingsordet: Kristi kropp, gitt for deg. Kristi blod, gitt for deg. (Alternativt: Dette er Jesu legeme. Dette er Jesu blod.)\nEtter utdelingen:\n{{r}}L |{{/r}} Den korsfestede og oppstandne Jesus Kristus har nå gitt oss sin kropp og sitt blod som han gav til soning for alle våre synder.\nA (eller L) | Han styrke oss og holde oss oppe i en sann tro til det evige liv.\n{{r}}L |{{/r}} Fred være med dere.",
						"text": "",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "n23",
						"type": "tekst",
						"heading": "23 Måltidets avslutning – Takkebønn",
						"instr": "Innledes med L/ML | La oss takke og be. Alteret ryddes.",
						"alts": [
							{
								"label": "Takkebønn 1 (kan synges)",
								"text": "{{r}}L/ML |{{/r}} Vi takker deg, himmelske Far, for dine velsignede gaver.\nVi ber deg at du ved disse gavene vil bevare oss i troen på deg, forene oss i din kjærlighet og stadfeste i oss håpet om det evige liv, for Jesu Kristi skyld.\n{{r}}M |{{/r}} Amen."
							},
							{
								"label": "Takkebønn 2",
								"text": "{{r}}L/ML |{{/r}} Vi takker deg, visdommens Gud, for ditt måltids dype hemmelighet: Brødet vi har brutt, er ett. Din Sønn har gitt sitt liv for én verden og én menneskehet. Vi ber:\nA/L/ML | Hjelp oss å høre det ropet du har hørt, å se den nøden du har sett, og å elske vår neste som oss selv."
							},
							{
								"label": "Takkebønn 3",
								"text": "{{r}}L/ML |{{/r}} Vi takker deg, nådige Gud, du som gjennom brødet og vinen har gitt oss del i Jesu Kristi seierrike død og oppstandelse. Vi ber:\nA/L/ML | Styrk oss ved din Ånd til vitnesbyrd og tjeneste i verden."
							},
							{
								"label": "Takkebønn 4",
								"text": "{{r}}L/ML |{{/r}} Trofaste Gud, du som i dåpen har gitt oss barnekår og gjort oss til arvinger i ditt rike. Vi takker deg for dette måltidet, hvor du har gitt oss syndenes forlatelse og fornyet i oss troen på dine løfter. Vi ber:\nA/L/ML | Styrk oss ved din Ånd til vitnesbyrd og tjeneste i verden."
							}
						],
						"text": "",
						"selAlt": 0
					}
				]
			},
			{
				"title": "IV. Sendelse",
				"items": [
					{
						"id": "e24",
						"type": "salme",
						"heading": "* 24 Salme",
						"optional": true,
						"instr": "Salmen kan flyttes til Postludium/Utgangsprosesjon, ledd 27."
					},
					{
						"id": "e25",
						"type": "tekst",
						"heading": "* 25 Velsignelse",
						"instr": "Velsignelsen synges eller fremsies. Den enkelte kan gjøre korsets tegn.",
						"alts": [
							{
								"label": "Med lovprisning BENEDICAMUS",
								"text": "{{r}}L/ML |{{/r}} La oss prise Herren.\n{{r}}M |{{/r}} Gud være lovet. Halleluja. Halleluja. Halleluja.\n{{r}}L |{{/r}} Herren velsigne deg og bevare deg.\nHerren la sitt ansikt lyse over deg og være deg nådig. Herren løfte sitt åsyn på deg og gi deg fred.\n{{r}}M |{{/r}} Amen. Amen. Amen."
							},
							{
								"label": "Med hilsen SALUTATIO",
								"text": "{{r}}L |{{/r}} Herren være med dere.\n{{r}}M |{{/r}} Og med deg være Herren.\n{{r}}L |{{/r}} Herren velsigne deg og bevare deg.\nHerren la sitt ansikt lyse over deg og være deg nådig. Herren løfte sitt åsyn på deg og gi deg fred.\n{{r}}M |{{/r}} Amen. Amen. Amen."
							},
							{
								"label": "Ta imot velsignelsen",
								"text": "{{r}}L |{{/r}} Ta imot velsignelsen.\n{{r}}L |{{/r}} Herren velsigne deg og bevare deg.\nHerren la sitt ansikt lyse over deg og være deg nådig. Herren løfte sitt åsyn på deg og gi deg fred.\n{{r}}M |{{/r}} Amen. Amen. Amen."
							}
						],
						"text": "",
						"selAlt": 0
					},
					{
						"id": "e26",
						"type": "tekst",
						"heading": "* 26 Utsendelse",
						"instr": "Dersom menigheten blir sittende under postludiet, kan utsendelsesordene sies etter postludiet.",
						"alts": [
							{
								"label": "La oss gå i fred",
								"text": "{{r}}L/ML |{{/r}} La oss gå i fred,\n{{r}}A |{{/r}} i Jesu Kristi navn."
							},
							{
								"label": "Gå i fred. Tjen Herren med glede.",
								"text": "{{r}}L/ML |{{/r}} Gå i fred. Tjen Herren med glede."
							}
						],
						"text": "",
						"selAlt": 0
					},
					{
						"id": "e27",
						"type": "instruks",
						"heading": "* 27 Postludium/Utgangsprosesjon",
						"optional": true,
						"instr": "Dersom det er utgangsprosesjon, kan menigheten følge etter prosesjonen. I stedet for postludium kan det synges en salme mens menigheten går ut.",
						"text": "",
						"alts": [],
						"selAlt": 0
					}
				]
			}
		],
		"visInstr": true,
		"visRoles": true,
		"visSalmeinfo": true,
		"malForm": "bokmål"
	},
	{
		"id": "dop-i-hovedgudstjenesten-2017",
		kategori: "Dåp og konfirmasjon",
		oversettelser: ["dåp-i-hovedgudstjenesten-2017-nynorsk"],
		"name": "Dåp i hovedgudstjenesten (2017)",
		"description": "Grunnordningen for dåp i hovedgudstjenesten i bokmål, vedtatt av Kirkemøtet 2017.",
		"kanGudstjeneste": false,
		"sections": [
			{
				"title": "Dåp i hovedgudstjenesten",
				"items": [
					{
						"id": "h-l-dap",
						"type": "instruks",
						"heading": "DÅP",
						"instr": "Dåp i hovedgudstjenesten skjer normalt her (ettersatt foran Dagens bønn i ordningen). Ordningen er vedtatt av Kirkemøtet 2017.",
						"text": "",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "h-l-dap2",
						"type": "tekst",
						"heading": "1 Mottakelse til dåp",
						"optional": true,
						"introAlts": [
							{
								"label": "Mottakelse",
								"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den hellige ånds navn."
							},
							{
								"label": "Eller",
								"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den hellige ånds navn: Vår skaper, frigjører og livgiver."
							}
						],
						"selIntro": 0,
						"alts": [
							{
								"label": "Ved dåp av barn",
								"text": "{{r}}L |{{/r}} Med takk og glede bringer vi i dag dette barnet/disse barna til Gud i den hellige dåp. I dåpen tar Gud imot oss og forener oss med den korsfestede og oppstandne Jesus Kristus."
							},
							{
								"label": "Ved dåp av større barn, unge eller voksne",
								"text": "{{r}}L |{{/r}} Med takk og glede bringer vi i dag NN/dere til Gud i den hellige dåp. I dåpen tar Gud imot oss og forener oss med den korsfestede og oppstandne Jesus Kristus."
							}
						],
						"selAlt": 0,
						"text": ""
					},
					{
						"id": "h-l-dap3",
						"type": "tekst",
						"heading": "Bibelord",
						"optional": true,
						"instr": "Følgende skriftord kan leses. Ved dåp av større barn, unge eller voksne kan Markus-teksten erstattes med ett av alternativene.",
						"introAlts": [
							{
								"label": "Skriftord",
								"text": "{{r}}L |{{/r}} For så høyt har Gud elsket verden at han ga sin Sønn, den enbårne, for at hver den som tror på ham, ikke skal gå tapt, men ha evig liv.\nBIBELREF | Joh 3,16"
							}
						],
						"selIntro": 0,
						"alts": [
							{
								"label": "Mark 10,13-16",
								"text": "{{r}}L |{{/r}} Hør hvor vennlig Jesus tar imot barna og åpner Guds rike for dem:\n{{r}}ML/L |{{/r}} De bar små barn til Jesus for at han skulle røre ved dem, men disiplene viste dem bort. Da Jesus så det, ble han sint og sa til dem: «La de små barna komme til meg, og hindre dem ikke! For Guds rike tilhører slike som dem. Sannelig, jeg sier dere: Den som ikke tar imot Guds rike slik som et lite barn, skal ikke komme inn i det.» Og han tok dem inn til seg, la hendene på dem og velsignet dem.\nBIBELREF | Mark 10,13-16"
							},
							{
								"label": "Tit 3,4-7",
								"text": "{{r}}L |{{/r}} Hør hva apostelen Paulus sier om dåpen:\n{{r}}ML/L |{{/r}} Det ble åpenbart hvor god vår Gud og frelser er, og at han elsket menneskene: Han frelste oss, ikke på grunn av våre rettferdige gjerninger, men fordi han er barmhjertig. Han frelste oss ved badet som gjenføder og fornyer ved Den hellige ånd, som han så rikelig har øst ut over oss ved Jesus Kristus, vår frelser, så vi skulle bli rettferdige ved hans nåde og bli arvinger til det evige liv, som er vårt håp.\nBIBELREF | Tit 3,4-7"
							},
							{
								"label": "Joh 3,1-5",
								"text": "{{r}}L |{{/r}} Jesus sier at vi blir født på ny i dåpen:\n{{r}}ML/L |{{/r}} Det var en mann som het Nikodemus. Han var fariseer og en av jødenes rådsherrer. Han kom til Jesus om natten og sa: «Rabbi, vi vet at du er en lærer som er kommet fra Gud. For ingen kan gjøre de tegnene du gjør, uten at Gud er med ham.» Jesus svarte: «Sannelig, sannelig, jeg sier deg: Den som ikke blir født på ny, kan ikke se Guds rike.» «Hvordan kan en som er gammel, bli født?» sa Nikodemus. «Kan noen komme inn i mors liv igjen og bli født for andre gang?» Jesus svarte: «Sannelig, sannelig, jeg sier deg: Den som ikke blir født av vann og Ånd, kan ikke komme inn i Guds rike.»\nBIBELREF | Joh 3,1-5"
							},
							{
								"label": "Rom 6,3-8",
								"text": "{{r}}L |{{/r}} Hør hva apostelen Paulus sier om dåpen:\n{{r}}ML/L |{{/r}} Vet dere ikke at alle vi som ble døpt til Kristus Jesus, ble døpt til hans død? Vi ble begravet med ham da vi ble døpt med denne dåpen til døden. Og som Kristus ble reist opp fra de døde ved sin Fars herlighet, skal også vi vandre i et nytt liv. Har vi vokst sammen med Kristus i en død som er lik hans, skal vi være ett med ham i en oppstandelse som er lik hans. Vi vet at vårt gamle menneske ble korsfestet med ham, for at den kroppen som er underlagt synden, skulle tilintetgjøres og vi ikke lenger være slaver under synden. For den som er død, er befridd fra synden. Er vi døde med Kristus, tror vi at vi også skal leve med ham.\nBIBELREF | Rom 6,3-8"
							}
						],
						"selAlt": 0,
						"text": ""
					},
					{
						"id": "h-l-dap4",
						"type": "tekst",
						"heading": "Takkebønn",
						"optional": true,
						"instr": "Her, eller før den avsluttende lovprisningen (1 Pet 1,3), kan liturgen si noe kortfattet om den aktuelle dåpshandlingen.",
						"text": "{{r}}L |{{/r}} La oss takke og be:\n{{r}}L/ML |{{/r}} Evige Gud, du som gir liv til alt som lever, og har skapt oss i ditt bilde:\nVi takker deg for NN/NN (fornavn). Hun/Han/De er dyrebar(e) i dine øyne. Omslutt henne/ham/dem med din kjærlighet og gi henne/ham/dem et hjem i din kirke.\nAmen.",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "h-l-dap5",
						"type": "salme",
						"heading": "2 Dåpssalme",
						"optional": true,
						"instr": "En dåpssalme synges enten her, før 1 Mottakelse til dåp, før 4 Fadderansvaret eller som avslutning på dåpshandlingen. Dåpssalmen kan deles opp og synges på flere av disse stedene i dåpsliturgien. Det kan også fremføres korsang, solosang eller instrumentalmusikk på ett av disse stedene."
					},
					{
						"id": "h-l-dap6",
						"type": "tekst",
						"heading": "3 Dåpsbefalingen",
						"optional": true,
						"instr": "Teksten leses av en i dåpsfølget, en annen medliturg eller liturgen.",
						"text": "{{r}}L |{{/r}} La oss høre Jesu ord og befaling om den hellige dåp:\n{{r}}ML/L |{{/r}} Jeg har fått all makt i himmelen og på jorden. Gå derfor og gjør alle folkeslag til disipler: Døp dem til Faderens og Sønnens og Den hellige ånds navn og lær dem å holde alt det jeg har befalt dere. Og se, jeg er med dere alle dager inntil verdens ende.\nBIBELREF | Matt 28,18-20",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "h-l-dap7",
						"type": "tekst",
						"heading": "4 Fadderansvaret",
						"optional": true,
						"alts": [
							{
								"label": "Ved dåp av barn",
								"text": "{{r}}L |{{/r}} Vil foreldre og faddere reise seg.\nDere skal være vitner om at dette barnet/disse barna er døpt med den kristne dåp. Sammen med vår menighet og hele kirken får dere del i et hellig ansvar: å vise omsorg for henne/ham/dem, be for henne/ham/dem, lære henne/ham/dem selv å be og hjelpe henne/ham/dem til å bruke Guds ord og delta i den hellige nattverd, så hun/han/de kan leve og vokse i den kristne tro."
							},
							{
								"label": "Ved dåp av større barn, unge eller voksne",
								"text": "{{r}}L |{{/r}} Vil (foreldre og) faddere reise seg.\nDere skal være vitner om at NN/disse er døpt med den kristne dåp. Sammen med vår menighet og hele kirken får dere del i et hellig ansvar: å vise omsorg for henne/ham/dem, be for henne/ham/dem og hjelpe henne/ham/dem til å bruke Guds ord og delta i den hellige nattverd, så hun/han/de kan leve og vokse i den kristne tro."
							}
						],
						"selAlt": 0,
						"text": ""
					},
					{
						"id": "h-l-dap8",
						"type": "tekst",
						"heading": "5 Forsakelsen og troen",
						"optional": true,
						"instr": "Den apostoliske trosbekjennelse.",
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}A |{{/r}} Jeg forsaker djevelen og alle hans gjerninger og alt hans vesen.\nJeg tror på Gud Fader, den allmektige, himmelens og jordens skaper.\nJeg tror på Jesus Kristus,\nGuds enbårne Sønn, vår Herre,\nsom ble unnfanget ved Den hellige ånd,\nfødt av jomfru Maria,\npint under Pontius Pilatus,\nkorsfestet, død og begravet,\nfór ned til dødsriket,\nstod opp fra de døde tredje dag,\nfór opp til himmelen,\nsitter ved Guds, den allmektige Faders høyre hånd,\nskal derfra komme igjen\nfor å dømme levende og døde.\nJeg tror på Den hellige ånd,\nen hellig, allmenn kirke,\nde helliges samfunn,\nsyndenes forlatelse,\nlegemets oppstandelse\nog det evige liv.\nAmen."
							},
							{
								"label": "Ved dåp av barn",
								"text": "{{r}}L |{{/r}} La oss sammen bekjenne forsakelsen og troen som vi døpes til.\n(Alle reiser seg.)"
							},
							{
								"label": "Ved dåp av større barn, unge eller voksne",
								"text": "{{r}}L |{{/r}} Vil du sammen med denne menigheten bekjenne forsakelsen og troen som vi døpes til?\n{{r}}Dåpskandidaten |{{/r}} Ja.\n(Dåpskandidaten kan om nødvendig bekrefte sitt ja, her og ved dåpshandlingen, på andre måter enn med verbalt språk. De som selv kan svare på spørsmålet, spørres først. Når alle har svart, sier liturgen:)\n{{r}}L |{{/r}} La oss sammen bekjenne forsakelsen og troen.\n(Alle reiser seg.)"
							}
						],
						"selIntro": 0,
						"text": "",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "h-l-dap9",
						"type": "tekst",
						"heading": "6 Dåpshandlingen",
						"optional": true,
						"introAlts": [
							{
								"label": "Bønn ved døpefonten",
								"text": "@NOTAT Vannet helles i døpefonten.\n{{r}}L |{{/r}} Barmhjertige Gud, vi takker deg for at dåpens vann ved ditt ord er en nådens kilde, der du tilgir oss vår synd, frelser oss fra dødens makt og gir oss løfte om det evige liv.\nSend din Ånd så hun/han/de som døpes reises opp til det nye livet med Jesus Kristus, vår Herre.\n@NOTAT Mellom hver dåp kan det synges et vers fra en egnet salme. Dåpsfølget går fram til døpefonten."
							}
						],
						"selIntro": 0,
						"alts": [
							{
								"label": "Ved dåp av barn",
								"text": "{{r}}L |{{/r}} Hva heter barnet?\n@NOTAT Den som bærer barnet, sier barnets fornavn.\n{{r}}L |{{/r}} Vil dere at NN skal døpes til Faderens og Sønnens og Den hellige ånds navn og oppdras til et liv i den kristne forsakelse og tro?\n@NOTAT Den som bærer barnet, foreldre/foresatte og faddere, svarer:\nJa."
							},
							{
								"label": "Ved dåp av større barn, unge eller voksne",
								"text": "{{r}}L |{{/r}} Hva heter du?\n(Den som skal døpes, svarer selv ved å si fornavnet sitt. Om nødvendig kan en annen si navnet.)\n{{r}}L |{{/r}} NN, vil du bli døpt til Faderens og Sønnens og Den hellige ånds navn og leve i den kristne forsakelse og tro?\n(Den som skal døpes, svarer:)\nJa."
							}
						],
						"selAlt": 0,
						"avslutningAlts": [
							{
								"label": "Korsets tegn, dåpen og velsignelsen",
								"text": "@NOTAT Liturgen vender seg mot barnets/dåpskandidatens ansikt og ber bønnen med åpen håndflate.\n{{r}}L |{{/r}} Gud bevare din utgang og din inngang fra nå og til evig tid.\nJeg tegner deg med det hellige korsets tegn ✠ til vitnesbyrd om at du skal tilhøre den korsfestede og oppstandne Jesus Kristus og tro på ham.\n{{r}}L |{{/r}} NN, etter vår Herre Jesu Kristi ord og befaling døper jeg deg til Faderens og Sønnens og Den hellige ånds navn.\n@NOTAT Mens dette sies, øser liturgen med hånden rikelig med vann over hodet til den som døpes, tre ganger.\n@NOTAT Liturgen legger, gjerne sammen med fadderne, hånden på den døptes hode og sier:\n{{r}}L |{{/r}} Den allmektige Gud har i dåpen gitt deg sin hellige Ånd, født deg på ny og tatt deg inn i sin troende menighet. Gud styrke deg med sin nåde til det evige liv.\nFred være med deg."
							}
						],
						"selAvsl": 0,
						"text": ""
					},
					{
						"id": "h-l-dap10",
						"type": "tekst",
						"heading": "Presentasjon av den døpte",
						"optional": true,
						"text": "@NOTAT Barnet vendes mot menigheten eller løftes opp. Ved dåp av større barn, unge eller voksne kan disse vende seg mot menigheten. Følgende ord sies:\n{{r}}L |{{/r}} Dette er NN, Guds barn, døpt inn i vår menighet og Kristi verdensvide kirke.",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "h-l-dap11",
						"type": "tekst",
						"heading": "Dåpslyset",
						"optional": true,
						"text": "@NOTAT Etter hver dåp og presentasjon kan det tennes et lys. Lystenning kan skje her eller under menighetens forbønn. Liturgen kan si:\n{{r}}L |{{/r}} Et lys er tent for NN.\n@NOTAT Lysene settes i en lysholder. Når alle dåpslysene er tent, sier liturgen:\n{{r}}L |{{/r}} Jesus sier: «Jeg er verdens lys. Den som følger meg, skal ikke vandre i mørket, men ha livets lys.»\nBIBELREF | Joh 8,12",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "h-l-dap13",
						"type": "tekst",
						"heading": "7 Bønn og lovprisning",
						"optional": true,
						"instr": "Bønnen leses her eller under menighetens forbønn.",
						"alts": [
							{
								"label": "A",
								"text": "{{r}}ML/L |{{/r}} Trofaste Gud, vi takker deg for dåpen, der du tar imot oss og kaller oss ved navn. Vi ber for NN/barna/dem som er døpt i dag. Vær med henne/ham/dem gjennom livet og bevar henne/ham/dem i dåpens nåde. Styrk foreldre og faddere i deres oppgave.\nGud, hør vår bønn."
							},
							{
								"label": "B",
								"text": "{{r}}ML/L |{{/r}} Trofaste Gud, vi takker deg for dåpen, der du tar oss inn i din kirke.\nVi ber for NN/barna/dem som er døpt i dag. Hold din vernende hånd over henne/ham/dem, og gi kjærlighet og visdom til alle som har ansvar for henne/ham/dem.\nGud, hør vår bønn."
							},
							{
								"label": "C",
								"text": "{{r}}ML/L |{{/r}} Trofaste Gud, vi takker deg for dåpen og løftet om at Jesus er med oss alle våre dager. Vi ber for NN/dem som er døpt i dag. Bevar henne/ham/dem i troen på deg, så hun/han/de kan vandre i lyset og nå det evige mål i ditt rike.\nGud, hør vår bønn."
							}
						],
						"selAlt": 0,
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}L |{{/r}} La oss takke og be."
							}
						],
						"selIntro": 0,
						"text": ""
					},
					{
						"id": "h-l-dap16",
						"type": "tekst",
						"heading": "Fadervår (dåpsliturgien)",
						"optional": true,
						"instr": "Fadervår fremsies. Dersom det er nattverd i gudstjenesten, kan Fadervår falle bort her. Det er også anledning til å benytte Fadervår etter 1977-liturgien eller etter 1920-liturgien.",
						"text": "{{r}}L |{{/r}} La oss sammen be den bønnen Jesus har lært oss:\n{{r}}A |{{/r}} Vår Far i himmelen!\nLa navnet ditt helliges.\nLa riket ditt komme.\nLa viljen din skje på jorden slik som i himmelen.\nGi oss i dag vårt daglige brød,\nog tilgi oss vår skyld,\nslik også vi tilgir våre skyldnere.\nOg la oss ikke komme i fristelse,\nmen frels oss fra det onde.\nFor riket er ditt og makten og æren i evighet.\nAmen.",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "h-l-dap14",
						"type": "tekst",
						"heading": "Lovprisning",
						"optional": true,
						"text": "{{r}}L |{{/r}} Velsignet er Gud, vår Herre Jesu Kristi Far, han som i sin rike miskunn har født oss på ny til et levende håp ved Jesu Kristi oppstandelse fra de døde!\nBIBELREF | 1 Pet 1,3",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "h-l-dap15",
						"type": "salme",
						"heading": "Evt. sang",
						"optional": true,
						"instr": "Dåpsliturgien avsluttes eventuelt med sang, jf. rubrikken til punkt 2."
					}
				]
			}
		],
		"visInstr": true,
		"visRoles": true,
		"visSalmeinfo": true,
		"malForm": "bokmål"
	},
	{
		"id": "gravferd-2003",
		kategori: "Gravferd",
		"liturgiType": "gravferd",
		"name": "Ordning for gravferd (2003)",
		"description": "Ordning for gravferd fra kirke eller krematorium — vedtatt av Kirkemøtet 2002, med alle alternativer og skriftlesningstekstgrupper.",
		"sections": [
			{
				"title": "Inngang og minneord",
				"items": [
					{
						"id": "gf-1",
						"type": "instruks",
						"heading": "1 Klokkeringing",
						"text": "",
						"instr": "Mens det ringes sammen, tar liturgen plass i koret.",
						"alts": [],
						"optional": true,
						"selAlt": 0
					},
					{
						"id": "gf-2",
						"type": "instruks",
						"heading": "2 Preludium",
						"text": "",
						"instr": "Som preludium kan det fremføres egnet instrumentalmusikk, korsang eller solosang. Preludiet kan være forspill til første salme.",
						"alts": [],
						"optional": true,
						"selAlt": 0
					},
					{
						"id": "gf-3",
						"type": "salme",
						"heading": "3 Salme",
						"text": "",
						"instr": "Denne salmen kan eventuelt flyttes til etter ledd 4.",
						"alts": [],
						"optional": true,
						"salmeNr": "",
						"salmeTittel": ""
					},
					{
						"id": "gf-4",
						"type": "tekst",
						"heading": "4 Inngangsord",
						"instr": "*Teksten i klammer kan utelates ved kremasjon.* Deretter kan liturgen fortsette med et av skriftordene.",
						"alts": [
							{
								"label": "Joh 3,16 — standard skriftord",
								"text": "Så høyt har Gud elsket verden at han gav sin Sønn, den enbårne, for at hver den som tror på ham, ikke skal gå fortapt, men ha evig liv.\nBIBELREF | Joh 3,16"
							},
							{
								"label": "Skriftord A — Matt 11,28",
								"text": "Jesus sier: Kom til meg, alle dere som strever og bærer tunge byrder, og jeg vil gi dere hvile.\nBIBELREF | Matt 11,28"
							},
							{
								"label": "Skriftord B — Sal 50,15",
								"text": "Gud sier i sitt ord: Kall på meg på nødens dag, så vil jeg utfri deg, og du skal gi meg ære.\nBIBELREF | Sal 50,15"
							}
						],
						"optional": false,
						"selAlt": 0,
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}L |{{/r}} Nåde være med dere og fred fra Gud vår Far og Herren Jesus Kristus.\nVi er samlet her for å ta avskjed med (navnet nevnes).\n*Sammen vil vi overgi ham/henne i Guds hender [og følge ham/henne til det siste hvilestedet].*"
							}
						],
						"selIntro": 0,
						"text": ""
					},
					{
						"id": "gf-5",
						"type": "tekst",
						"heading": "5 Inngangsbønn",
						"instr": "",
						"alts": [
							{
								"label": "A — Sal 130,1-8",
								"text": "Fra dypet roper jeg til deg, Herre. Herre, hør min røst!\nVend øret til mitt rop om nåde.\nDersom du, Herre, vil gjemme på synder, Herre, hvem kan da bli stående?\nMen hos deg er tilgivelse, så vi skal frykte deg.\nJeg setter mitt håp til Herren, jeg lengter, jeg venter på hans ord.\nMin sjel på Herren, mer enn vektere på morgenen, vektere på morgenen.\nVent på Herren, Israel!\nFor hos Herren er miskunn og kraft til å løse ut.\nHan skal løse Israel ut fra alle deres synder.\nBIBELREF | Sal 130,1-8"
							},
							{
								"label": "B — Sal 90,1-4.12",
								"text": "Herre, du har vært en bolig for oss i slekt etter slekt. Før fjellene ble født, før jorden og verden ble til, ja, fra evighet og til evighet er du, Gud.\nDu lar mennesket bli til støv igjen og sier: «Menneskebarn, vend tilbake!»\nFor tusen år er i dine øyne som dagen i går da den fór forbi, eller som en nattevakt.\nLær oss å telle våre dager, så vi kan få visdom i hjertet!\nBIBELREF | Salme 90,1-4.12"
							},
							{
								"label": "C — Sal 22,2-3.20",
								"text": "Min Gud, min Gud, hvorfor har du forlatt meg? Hvorfor er du så langt borte når jeg trenger hjelp og skriker ut min nød?\nMin Gud, jeg roper om dagen, men du svarer ikke, jeg roper om natten og får ikke ro.\nMen du, Herre, vær ikke langt borte, min styrke, skynd deg og hjelp meg!\nBIBELREF | Sal 22,2-3.20"
							},
							{
								"label": "D",
								"text": "Hellige Gud, himmelske Far, du råder over liv og død. Når vi skilles fra en av våre kjære, styrk oss da i troen, så vi også ved graven kan håpe på deg.\nHerre Jesus Kristus, du trofaste Frelser, som gikk gjennom død og grav for oss: Bli hos oss i vår siste nød og gi oss engang å samles i din Fars hus med deg og alle dine.\nHellige Ånd, du vår trøster i liv og død, fyll alle sørgende med din trøst. Fri oss fra åndelig død, dra alle til deg og gi oss å ha vår skatt i himmelen."
							},
							{
								"label": "E",
								"text": "Herre vår Gud, hos deg er livets kilde. I ditt lys ser vi lys.\nI deg er det vi lever, rører oss og er til.\nBevar oss i liv og død i din kjærlighet, ved din Sønn Jesus Kristus, vår Herre."
							},
							{
								"label": "F",
								"text": "Gode Gud, du som ser oss og kjenner oss, kom oss nær med din trøst."
							}
						],
						"optional": false,
						"selAlt": 0,
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}L |{{/r}} La oss be."
							}
						],
						"selIntro": 0,
						"text": ""
					},
					{
						"id": "gf-6",
						"type": "tekst",
						"heading": "6 Minneord",
						"text": "",
						"instr": "Et kort minneord holdes av liturgen eller av en representant for de pårørende. Det bør inneholde noen biografiske momenter med særlig vekt på hva avdødes liv har betydd for dem som stod ham/henne nær, og for andre livssammenhenger han/hun har stått i.\nHer kan følge korte hilsninger, pålegging av blomster og/eller krans og eventuelt andre minnehandlinger, som opplesning, musikk, lystenning o. a.",
						"alts": [],
						"optional": true,
						"selAlt": 0
					},
					{
						"id": "gf-7",
						"type": "salme",
						"heading": "7 Salme eller musikkinnslag",
						"text": "",
						"instr": "Eventuelt musikkinnslag kan være vokalt eller instrumentalt.",
						"alts": [],
						"optional": true,
						"salmeNr": "",
						"salmeTittel": ""
					},
					{
						"id": "gf-8",
						"type": "tekst",
						"heading": "8 Skriftlesning",
						"instr": "",
						"alts": [
							{
								"text": "{{r}}L |{{/r}} La oss høre hva Guds ord vitner om livet og døden, og dommen og vårt håp i Jesus Kristus."
							},
							{
								"text": "{{r}}L |{{/r}} La oss høre hvordan Jesus åpner Guds rike for barna."
							}
						],
						"optional": false,
						"selAlt": 0,
						"introAlts": [
							{
								"label": "Innledning",
								"text": "@NOTAT Her følger tre lesninger — se tekstgruppene til slutt i ordningen. Tekstene velges slik at de dekker de innholdsmomenter som er nevnt foran. Menigheten sitter under lesningen. Tekstene kan leses av liturgen eller av en eller flere andre."
							}
						],
						"selIntro": 0,
						"text": ""
					}
				]
			},
			{
				"title": "Skriftlesninger",
				"items": [
					{
						"id": "gf-tg-tekstgruppe-i",
						"type": "tekst",
						"heading": "Tekstgruppe I",
						"text": "",
						"instr": "Her følger tekstene i tekstgruppe i — velges til ledd 8 Skriftlesning eller 17 Skriftlesning.",
						"alts": [
							{
								"label": "A — Job 19,25-27a.[27b]",
								"text": "Jeg vet at min gjenløser lever. Som den siste skal han stå fram i støvet.\nNår huden er revet av meg og kjøttet er borte, skal jeg se Gud.\nMine øyne ser, det er jeg som får se ham, ikke en fremmed.\nBIBELREF | Job 19,25-27a.[27b]"
							},
							{
								"label": "B — Sal 23",
								"text": "Herren er min hyrde, jeg mangler ikke noe.\nHan lar meg ligge i grønne enger,\nhan leder meg til vann der jeg finner hvile. Han gir meg nytt liv.\nHan fører meg på rettferdighets stier for sitt navns skyld.\nOm jeg enn skulle vandre i dødsskyggens dal, frykter jeg ikke noe ondt.\nFor du er med meg.\nDin kjepp og din stav, de trøster meg.\nDu dekker bord for meg like foran mine fiender.\nDu salver mitt hode med olje. Mitt beger flyter over.\nBare godhet og miskunn skal følge meg alle mine dager, og jeg skal bo i Herrens hus gjennom alle tider.\nBIBELREF | Salme 23"
							},
							{
								"label": "C — Sal 42,2-6",
								"text": "Som hjorten lengter etter bekker med vann, lengter min sjel etter deg, min Gud.\nMin sjel tørster etter Gud, etter den levende Gud.\nNår skal jeg få komme fram for Guds ansikt?\nTårer er mitt brød dag og natt.\nHele dagen spør de meg: «Hvor er din Gud?»\nDette minnes jeg, min lengsel veller fram:\nTil Guds hus vandret jeg i festskaren med jubelrop og lovsang\n– en pilegrimsskare i fest.\nHvorfor er du tynget av sorg, min sjel, hvorfor er du urolig?\nJeg vil vente på Gud!\nEnda en gang skal jeg prise ham, min Frelser og min Gud.\nBIBELREF | Salme 42,2-6"
							},
							{
								"label": "D — Sal 73,23-26",
								"text": "Men jeg blir alltid hos deg, du har grepet min høyre hånd.\nDu leder meg med ditt råd,\nog siden tar du imot meg i herlighet.\nHvem har jeg ellers i himmelen?\nNår jeg er hos deg, har jeg ikke glede i noe på jorden.\nOm kropp og hjerte forgår,\ner Gud for evig mitt hjertes klippe og min del.\nBIBELREF | Salme 73,23-26"
							},
							{
								"label": "E — Sal 103,13-17",
								"text": "Som en far er barmhjertig mot sine barn,\ner Herren barmhjertig mot dem som frykter ham.\nFor han vet hvordan vi er skapt, han husker at vi er støv.\nDagene mennesket får, er som gress, det blomstrer som blomsten på marken.\nNår vinden farer over den, er den borte, stedet den stod på, vet ikke lenger av den.\nMen Herrens miskunn er fra evighet til evighet over dem som frykter ham.\nBIBELREF | Salme 103,13-17"
							},
							{
								"label": "F — Sal 121",
								"text": "Jeg løfter mine øyne mot fjellene. Hvor skal min hjelp komme fra?\nMin hjelp kommer fra Herren,\nhimmelens og jordens skaper.\nHan vil ikke la din fot vakle, din vokter vil ikke blunde!\nSe, han blunder ikke og sover ikke, Israels vokter.\nHerren er din vokter, Herren er din skygge ved din høyre hånd.\nSolen skal ikke skade deg om dagen heller ikke månen om natten.\nHerren skal bevare deg fra alt ondt. Han skal bevare ditt liv.\nHerren skal bevare din utgang og din inngang fra nå og til evig tid.\nBIBELREF | Salme 121"
							},
							{
								"label": "G — Sal 139,1-12.23-24",
								"text": "Herre, du ransaker meg og du vet – du vet om jeg sitter eller står,\npå lang avstand kjenner du mine tanker.\nOm jeg går eller ligger, ser du det, du kjenner alle mine veier.\nFør jeg har et ord på tungen, Herre, kjenner du det fullt ut.\nBakfra og forfra omgir du meg, du har lagt din hånd på meg.\nDet er et under jeg ikke forstår,\ndet er så høyt at jeg ikke kan fatte det. Hvor skulle jeg gå fra din pust,\nhvor kunne jeg flykte fra ditt ansikt?\nStiger jeg opp til himmelen, er du der, legger jeg meg i dødsriket, er du der.\nTar jeg soloppgangens vinger og slår meg ned der havet ender, da fører din hånd meg også der, din høyre hånd holder meg fast.\nJeg kan si: «La mørket skjule meg og lyset omkring meg bli natt»,\nmen mørket er ikke mørkt for deg, natten er lys som dagen,\nmørket er som lyset.\nRansak meg, Gud, og kjenn mitt hjerte, prøv meg og kjenn mine tanker!\nSe om jeg følger avguders vei,\nog led meg på evighetens vei!\nBIBELREF | Salme 139,1-12.23-24"
							},
							{
								"label": "H — Fork 3,1-2.4.6a.11a.14a",
								"text": "Alt har sin tid, det er en tid for alt som skjer under himmelen:\nen tid for å fødes, en tid for å dø,\nen tid for å plante, en tid for å rykke opp, en tid for å gråte, en tid for å le,\nen tid for å sørge, en tid for å danse; en tid for å lete, en tid for å miste.\nAlt skapte han vakkert, hver ting til sin tid.\nJa, alle tider har han lagt i menneskenes hjerte.\nJeg skjønte at alt Gud gjør, står gjennom alle tider.\nIngen kan legge noe til, og ingen kan trekke noe fra.\nBIBELREF | Fork 3,1-2.4.6a.11a.14a"
							},
							{
								"label": "I — Jes 49,14-16a",
								"text": "Sion sier: «Herren har forlatt meg, Herren har glemt meg.»\nKan en kvinne glemme sitt diende barn, en omsorgsfull mor det barnet hun bar?\nSelv om de skulle glemme,\nskal ikke jeg glemme deg.\nSe, jeg har tegnet deg i mine hender.\nBIBELREF | Jes 49,14-16a"
							},
							{
								"label": "J — Klag 3,22-26",
								"text": "Herren er nådig, vi går ikke til grunne.\nHans barmhjertighet tar ikke slutt,\nden er ny hver morgen.\nDin trofasthet er stor.\nJeg sier: Herren er min del, jeg setter mitt håp til ham.\nHerren er god mot dem\nsom venter på ham og søker ham.\nDet er godt å være stille\nog vente på hjelp fra Herren.\nBIBELREF | Klag 3,22-26"
							}
						],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "gf-tg-tekstgruppe-ii",
						"type": "tekst",
						"heading": "Tekstgruppe II",
						"text": "",
						"instr": "Her følger tekstene i tekstgruppe ii — velges til ledd 8 Skriftlesning eller 17 Skriftlesning.",
						"alts": [
							{
								"label": "A — Rom 6,3-5",
								"text": "Eller vet dere ikke at alle vi som ble døpt til Kristus Jesus, ble døpt til hans død? Vi ble begravet med ham da vi ble døpt med denne dåpen til døden. Og som Kristus ble reist opp fra de døde ved sin Fars herlighet, skal også vi vandre i et nytt liv. Har vi vokst sammen med Kristus i en død som er lik hans, skal vi være ett med ham i en oppstandelse som er lik hans.\nBIBELREF | Rom 6,3-5"
							},
							{
								"label": "B — Rom 8,31b-35.38-39",
								"text": "Er Gud for oss, hvem er da mot oss? Han som ikke sparte sin egen Sønn, men gav ham for oss alle, kan han gjøre noe annet enn å gi oss alt sammen med ham? Hvem kan anklage dem Gud har utvalgt? Gud er den som frikjenner. Hvem kan da fordømme? Kristus Jesus er den som døde, ja, mer enn det, han sto opp og sitter ved Guds høyre hånd, og han ber for oss. Hvem kan skille oss fra Kristi kjærlighet? Nød, angst, forfølgelse, sult, nakenhet, fare eller sverd?\nFor jeg er viss på at verken død eller liv, verken engler eller krefter, verken det som nå er eller det som kommer, eller noen makt, verken det som er i det høye eller i det dype, eller noen annen skapning, skal kunne skille oss fra Guds kjærlighet i Kristus Jesus, vår Herre.\nBIBELREF | Rom 8,31b-35.38-39"
							},
							{
								"label": "C — Rom 14,7-12",
								"text": "For ingen av oss lever for seg selv, og ingen dør for seg selv. Om vi lever, så lever vi for Herren, og om vi dør, så dør vi for Herren. Enten vi da lever eller dør, hører vi Herren til.\nDet var derfor Kristus døde og ble levende igjen, for at han skulle være Herre over både levende og døde. Men du, hvorfor dømmer du din bror, eller hvorfor ser du ned på din bror? Vi skal alle fram for Guds domstol, for det står skrevet:\nSå sant jeg lever, sier Herren, for meg skal hvert kne bøye seg,\nog hver tunge skal bekjenne Gud.\nSå skal altså hver enkelt av oss avlegge sitt eget regnskap for Gud.\nBIBELREF | Rom 14,7-12"
							},
							{
								"label": "D — 1 Kor 13,8-13",
								"text": "Kjærligheten tar aldri slutt. Profetgavene skal bli borte,\ntungene skal tie og kunnskapen forgå.\nFor vi forstår stykkevis og taler profetisk stykkevis.\nMen når det fullkomne kommer, skal det som er stykkevis, ta slutt.\nDa jeg var barn, talte jeg som et barn,\ntenkte jeg som et barn, forsto jeg som et barn. Men da jeg ble voksen, la jeg av det barnslige.\nNå ser vi i et speil, i en gåte, da skal vi se ansikt til ansikt.\nNå forstår jeg stykkevis,\nda skal jeg erkjenne fullt ut, slik Gud kjenner meg fullt ut.\nSå blir de stående, disse tre:\ntro, håp og kjærlighet.\nMen størst blant dem er kjærligheten.\nBIBELREF | 1 Kor 13,8-13"
							},
							{
								"label": "E — 1 Kor 15,53-57",
								"text": "For det forgjengelige må bli kledd i uforgjengelighet, og det dødelige må bli kledd i udødelighet. Og når dette forgjengelige er kledd i uforgjengelighet og dette dødelige er kledd i udødelighet, da oppfylles det som står skrevet: Døden er oppslukt, seieren vunnet. Død, hvor er din brodd? Død, hvor er din seier? Dødens brodd er synden, og syndens kraft er loven. Men Gud være takk som gir oss seier ved vår Herre Jesus Kristus!\nBIBELREF | 1 Kor 15,53-57"
							},
							{
								"label": "F — 1 Tess 5,8-11a",
								"text": "Men vi som hører dagen til, skal være edru, kledd med tro og kjærlighet som brynje og med håpet om frelse som hjelm. For Gud har ikke bestemt oss til vrede, men til å vinne frelse ved vår Herre Jesus Kristus. Han døde for oss for at vi skal leve sammen med ham enten vi våker eller sover. Derfor må dere oppmuntre og oppbygge hverandre.\nBIBELREF | 1 Tess 5,8-11a"
							},
							{
								"label": "G — Åp 21,1-5a",
								"text": "Og jeg så en ny himmel og en ny jord. For den første himmel og den første jord var borte, og havet fantes ikke mer. Og jeg så den hellige byen, det nye Jerusalem, stige ned fra himmelen, fra Gud, gjort i stand og pyntet som en brud for sin brudgom. Og jeg hørte fra tronen en høy røst som sa:\n«Se, Guds bolig er hos menneskene.\nHan skal bo hos dem,\nog de skal være hans folk,\nog Gud selv skal være hos dem.\nHan skal tørke bort hver tåre fra deres øyne,\nog døden skal ikke være mer,\nheller ikke sorg eller skrik eller smerte.\nFor det som en gang var, er borte.»\nHan som sitter på tronen, sa: «Se, jeg gjør alle ting nye.»\nBIBELREF | Åp 21,1-5a"
							}
						],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "gf-tg-tekstgruppe-iii",
						"type": "tekst",
						"heading": "Tekstgruppe III",
						"text": "",
						"instr": "Her følger tekstene i tekstgruppe iii — velges til ledd 8 Skriftlesning eller 17 Skriftlesning.",
						"alts": [
							{
								"label": "A — Matt 5,3-10",
								"text": "Salige er de som er fattige i ånden, for himmelriket er deres.\nSalige er de som sørger, for de skal trøstes.\nSalige er de ydmyke, for de skal arve jorden.\nSalige er de som hungrer og tørster etter rettferdigheten, for de skal mettes.\nSalige er de barmhjertige, for de skal få barmhjertighet.\nSalige er de rene av hjertet, for de skal se Gud.\nSalige er de som skaper fred, for de skal kalles Guds barn.\nSalige er de som blir forfulgt for rettferdighets skyld, for himmelriket er deres.\nBIBELREF | Matt 5,3-10"
							},
							{
								"label": "B — Matt 28,1-10",
								"text": "Da sabbaten var over og det begynte å lysne den første dag i uken, kom Maria Magdalena og den andre Maria for å se til graven. Med ett ble det et kraftig jordskjelv, for en Herrens engel steg ned fra himmelen, gikk fram og rullet steinen til side og satte seg på den. Han var som et lyn å se til, og drakten var hvit som snø. Vaktene skalv av redsel da de så ham, og de ble liggende som døde.\nMen engelen tok til orde og sa til kvinnene: «Frykt ikke! Jeg vet at dere leter etter Jesus, den korsfestede. Han er ikke her, han er stått opp, slik som han sa. Kom og se stedet hvor han lå! Skynd dere av sted og si til disiplene hans: «Han er stått opp fra de døde, og han går i forveien for dere til Galilea; der skal dere få se ham.» – Nå har jeg sagt dere det.»\nDa skyndte de seg bort fra graven, redde, men jublende glade, og de løp for å fortelle det til disiplene. Og se, Jesus kom mot dem og sa: «Vær hilset!» De gikk fram og omfavnet føttene hans og tilbad ham. Jesus sa til dem: «Frykt ikke! Gå og si til mine brødre at de skal dra til Galilea. Der skal de se meg.»\nBIBELREF | Matt 28,1-10"
							},
							{
								"label": "C — Mark 10,13-16",
								"text": "De bar små barn til ham for at han skulle røre ved dem, men disiplene viste dem bort. Da Jesus så det, ble han sint og sa til dem: «La de små barna komme til meg, og hindre dem ikke! For Guds rike tilhører slike som dem. Sannelig, jeg sier dere: Den som ikke tar imot Guds rike slik som et lite barn, skal ikke komme inn i det.» Og han tok dem inn til seg, la hendene på dem og velsignet dem.\nBIBELREF | Mark 10,13-16"
							},
							{
								"label": "D — Luk 12,35-38",
								"text": "Jesus sier: Spenn beltet om livet og hold lampene tent! Vær lik tjenere som venter sin herre hjem fra bryllupsfest og står klar til å lukke opp for ham så snart han kommer og banker på. Lykkelige er de tjenere som herren finner våkne når han kommer! Sannelig, jeg sier dere: Han skal binde opp kjortelen, la dem gå til bords og selv gå fram og tjene dem. Ja, lykkelige er de som han finner våkne, selv om han ikke kommer før i andre eller tredje nattevakt.\nBIBELREF | Luk 12,35-38"
							},
							{
								"label": "E — Joh 5,24-27",
								"text": "Jesus sier: Sannelig, sannelig, jeg sier dere: Den som hører mitt ord og tror på ham som har sendt meg, har evig liv og kommer ikke for dommen, men er gått over fra døden til livet.\nSannelig, sannelig, jeg sier dere: Den time kommer, ja, den er nå, da de døde skal høre Guds Sønns røst, og de som hører, skal leve. For slik Far har liv i seg selv, har han også gitt Sønnen å ha liv i seg selv, og han har gitt ham myndighet til å holde dom, fordi han er Menneskesønnen.\nBIBELREF | Joh 5,24-27"
							},
							{
								"label": "F — Joh 6,37-40",
								"text": "Jesus sier: Alle de som Far gir meg, kommer til meg, og den som kommer til meg, vil jeg aldri støte bort. For jeg er ikke kommet ned fra himmelen for å gjøre det jeg selv vil, men det han vil, han som har sendt meg. Og det han vil, han som har sendt meg, er at jeg ikke skal miste noen av alle dem han har gitt meg, men reise dem opp på den siste dag. For dette er min Fars vilje, at hver den som ser Sønnen og tror på ham, skal ha evig liv, og jeg skal reise ham opp på den siste dag.\nBIBELREF | Joh 6,37-40"
							},
							{
								"label": "G — Joh 10,14.28-29",
								"text": "Jesus sier: Jeg er den gode gjeteren. Jeg kjenner mine, og mine kjenner meg. Jeg gir dem evig liv. De skal aldri i evighet gå tapt, og ingen skal rive dem ut av min hånd. Det min Far har gitt meg, er større enn alt annet, og ingen kan rive det ut av min Fars hånd.\nBIBELREF | Joh 10,14.28-29"
							},
							{
								"label": "H — Joh 14,1-6",
								"text": "«La ikke hjertet bli grepet av angst. Tro på Gud og tro på meg! I min Fars hus er det mange rom. Var det ikke slik, hadde jeg da sagt dere at jeg går og vil gjøre i stand et sted for dere? Og når jeg har gått og gjort i stand et sted for dere, vil jeg komme tilbake og ta dere til meg, så dere skal være der jeg er. Og dit jeg går, vet dere veien.»\nTomas sier til ham: «Herre, vi vet ikke hvor du går. Hvordan kan vi da vite veien?» Jesus sier: «Jeg er veien, sannheten og livet. Ingen kommer til Far uten ved meg.»\nBIBELREF | Joh 14,1-6"
							}
						],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "gf-tg-barn",
						"type": "tekst",
						"heading": "Lesninger ved barns gravferd",
						"text": "",
						"instr": "Ved barns gravferd brukes f.eks. disse lesningene, innledet slik:\n{{r}}L |{{/r}} La oss høre hvordan Jesus åpner Guds rike for barna.\nDe tre tekstene leses i sammenheng. Ved gravferd for spedbarn eller barn som er døde før fødsel, kan en velge andre tekster enn de ovenstående, f.eks. Salme 39,5-8 eller Salme 139,1-6.13-18, eller tekster som særlig uttrykker lidelsen, smerten og det uforståelige.",
						"alts": [
							{
								"label": "Mark 10,13-16",
								"text": "De bar små barn til ham for at han skulle røre ved dem, men disiplene viste dem bort. Da Jesus så det, ble han sint og sa til dem: «La de små barna komme til meg, og hindre dem ikke! For Guds rike tilhører slike som dem. Sannelig, jeg sier dere: Den som ikke tar imot Guds rike slik som et lite barn, skal ikke komme inn i det.» Og han tok dem inn til seg, la hendene på dem og velsignet dem.\nBIBELREF | Mark 10,13-16"
							},
							{
								"label": "Joh 10,14.28-29",
								"text": "Jesus sier: Jeg er den gode gjeteren. Jeg kjenner mine, og mine kjenner meg. Jeg gir dem evig liv. De skal aldri i evighet gå tapt, og ingen skal rive dem ut av min hånd. Det min Far har gitt meg, er større enn alt annet, og ingen kan rive det ut av min Fars hånd.\nBIBELREF | Joh 10,14.28-29"
							},
							{
								"label": "Åp 21,1-5a",
								"text": "Herrens apostel sier: Og jeg så en ny himmel og en ny jord. For den første himmel og den første jord var borte, og havet fantes ikke mer. Og jeg så den hellige byen, det nye Jerusalem, stige ned fra himmelen, fra Gud, gjort i stand og pyntet som en brud for sin brudgom. Og jeg hørte fra tronen en høy røst som sa: «Se, Guds bolig er hos menneskene. Han skal bo hos dem, og de skal være hans folk, og Gud selv skal være hos dem. Han skal være deres Gud.\nHan skal tørke bort hver tåre fra deres øyne, og døden skal ikke være mer, heller ikke sorg eller skrik eller smerte. For det som en gang var, er borte.» Han som sitter på tronen, sa: «Se, jeg gjør alle ting nye.»\nBIBELREF | Åp 21,1-5a"
							},
							{
								"label": "",
								"text": "HERRE, lær meg at jeg skal dø,\nhvor få og tilmålte mine dager er,\nså jeg kan innse at mitt liv tar slutt.»\n\nSe, en håndfull levedager har du gitt meg,\nmin levetid er som ingenting for deg,\nhvert menneske er et pust.\n\n*Sela*\n\nSom skyggebilder går de omkring.\t\nDe uroer seg forgjeves.\nDe samler i hauger, \nmen vet ikke hvem som skal ha det.\n\nMen nå, Herre, hva skal jeg vente på?\nBare til deg står mitt håp.\nBIBELREF | Salme 39,5-8"
							},
							{
								"label": "",
								"text": "HERRE, du ransaker meg og du vet – \ndu vet om jeg sitter eller står,\npå lang avstand kjenner du mine tanker.\nOm jeg går eller ligger, ser du det,\ndu kjenner alle mine veier.\nFør jeg har et ord på tungen, HERRE,\nkjenner du det fullt ut.\nBakfra og forfra omgir du meg,\ndu har lagt din hånd på meg.\nDet er et under jeg ikke forstår,\ndet er så høyt at jeg ikke kan fatte det.\n\nFor du har skapt mine nyrer,\ndu har vevd meg i mors liv.\nJeg takker deg for at jeg er så underfullt laget.\nUnderfulle er dine verk, det vet jeg godt.\nKnoklene mine var ikke skjult for deg\nda jeg ble laget på hemmelig vis og vevd dypt i jorden.\nDine øyne så meg da jeg var et foster.\nAlle dager er skrevet opp i din bok,\t\nde fikk form før én av dem var kommet.\nDine tanker, Gud, er dyrebare for meg,\t\nsummen av dem er ufattelig!\nTeller jeg dem, er de talløse som sand,\nblir jeg ferdig, er jeg ennå hos deg.\nBIBELREF | Salme 139,1-6.13-18,"
							}
						],
						"optional": false,
						"enabled": false,
						"selAlt": 4
					},
					{
						"id": "ivfdy6j2",
						"type": "tekst",
						"heading": "Avslutning Skriftlesninger",
						"text": "@NOTAT Skriftlesningen avsluttes med:\n{{r}}L |{{/r}} Slik lyder Herrens ord.",
						"instr": "",
						"alts": [],
						"selAlt": null,
						"enabled": true,
						"optional": false
					}
				]
			},
			{
				"title": "Tale",
				"items": [
					{
						"id": "gf-9",
						"type": "salme",
						"heading": "9 Salme",
						"text": "",
						"instr": "Hvis ledd 7 er en salme, kan ledd 9 gå ut.",
						"alts": [],
						"optional": true,
						"salmeNr": "",
						"salmeTittel": ""
					},
					{
						"id": "gf-10",
						"type": "tekst",
						"heading": "10 Tale",
						"text": "",
						"instr": "Kort tale over et av de oppleste skriftordene eller over en annen høvelig tekst.",
						"alts": [],
						"optional": true,
						"selAlt": 0
					},
					{
						"id": "gf-11",
						"type": "tekst",
						"heading": "11 Bønn",
						"instr": "",
						"alts": [
							{
								"label": "A",
								"text": "{{r}}L |{{/r}} Evige Gud, vår tilflukt i sorgens tid, vær nær med din fred. Styrk oss i troen. Gi oss fremtid og håp. Vi takker deg for (navnet nevnes) og det du gav oss gjennom hans/hennes liv.\n*Barmhjertige Gud, vi overgir ham/henne i dine hender. Du som har skapt oss i ditt bilde og gitt oss Jesus Kristus som vår Frelser, reis oss opp på oppstandelsens dag til evig liv hos deg.*"
							},
							{
								"label": "B",
								"text": "{{r}}L |{{/r}} Jesus Kristus, du som lovet å være med oss alle dager inntil verdens slutt, vær du vår styrke og trøst, vårt lys og vår veiviser. La oss alle en gang ved troen på deg få del i oppstandelsens glede."
							},
							{
								"label": "C",
								"text": "{{r}}L |{{/r}} Evige Gud, himmelske Far, du har i din Sønn, Jesus Kristus, gitt oss seier over døden. Vi ber deg, led oss ved din Hellige Ånd, så vi aldri kommer bort fra deg, men lever vårt liv i troen på din Sønn og engang når fram til det evige liv i ditt rike, ved Jesus Kristus, vår Herre."
							},
							{
								"label": "D",
								"text": "{{r}}L |{{/r}} Herre Jesus Kristus, du som bar alle våre synder, vi takker deg for din kjærlighet som er sterkere enn døden. Gi oss del i frelsen du vant ved din død og oppstandelse, og før oss med din mektige hånd gjennom liv, død og dom inn til din evige glede."
							},
							{
								"label": "E",
								"text": "{{r}}L |{{/r}} Himmelske Far, vi takker deg for det du gav gjennom (navnet nevnes) som nå er gått bort. Styrk og trøst alle som sitter i sorg og savn. Vi overgir oss i din sterke hånd. Hjelp oss å leve i samfunn med deg, så vi engang kan fare herifra i fred, ved Jesus Kristus, din Sønn, vår Herre."
							},
							{
								"label": "F — bønn etter situasjonen",
								"text": "En bønn som er skrevet med tanke på den situasjonen de pårørende og lokalsamfunnet har opplevd i forbindelse med dødsfallet."
							}
						],
						"optional": false,
						"selAlt": 0,
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}L |{{/r}} La oss be."
							}
						],
						"selIntro": 0,
						"text": ""
					},
					{
						"id": "gf-12",
						"type": "tekst",
						"heading": "12 I dine hender",
						"text": "{{r}}A |{{/r}} I dine hender, Herre Gud, overgir jeg min ånd. Du forløser meg, Herre, du trofaste Gud.\n\nI dine hender, Herre Gud, overgir jeg min ånd. Ære være Faderen og Sønnen og Den hellige ånd. I dine hender, Herre Gud, overgir jeg min ånd.",
						"instr": "Dette leddet kan også synges som vekselsang, se Norsk salmebok 2013 nr 941.1 og 2. Her kan også følge Simeons lovsang (Luk 2,29-32), enten lest eller sunget, se Norsk salmebok 2013 nr 908 og 909.",
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "gf-13",
						"type": "tekst",
						"heading": "13 Fader vår",
						"instr": "",
						"alts": [
							{
								"label": "Vekselsang",
								"text": "{{r}}A |{{/r}} Vår Far i himmelen!\n{{r}}A |{{/r}} La navnet ditt helliges.\n{{r}}A |{{/r}} La riket ditt komme.\n{{r}}A |{{/r}} La viljen din skje på jorden slik som i himmelen.\n{{r}}A |{{/r}} Gi oss i dag vårt daglige brød,\n{{r}}A |{{/r}} og tilgi oss vår skyld, slik også vi tilgir våre skyldnere.\n{{r}}A |{{/r}} Og la oss ikke komme i fristelse, men frels oss fra det onde.\n{{r}}A |{{/r}} For riket er ditt, og makten og æren i evighet.\n{{r}}A |{{/r}} Amen."
							},
							{
								"label": "Lest",
								"text": "{{r}}A |{{/r}} Fader vår, du som er i himmelen!\nLa ditt navn holdes hellig.\nLa ditt rike komme.\nLa din vilje skje på jorden som i himmelen.\nGi oss i dag vårt daglige brød.\nForlat oss var skyld, som vi og forlater våre skyldnere.\nLed oss ikke inn i fristelse, men frels oss fra det onde.\nFor riket er ditt, og makten og æren i evighet.\nAmen."
							},
							{
								"label": "Alternativ",
								"text": "{{r}}L |{{/r}} La oss sammen be den bønnen Jesus har lært oss:\n{{r}}A |{{/r}} Vår Far i himmelen!\nLa navnet ditt helliges.\nLa riket ditt komme.\nLa viljen din skje på jorden slik som i himmelen.\nGi oss i dag vårt daglige brød,\nog tilgi oss vår skyld,\nslik også vi tilgir våre skyldnere.\nOg la oss ikke komme i fristelse,\nmen frels oss fra det onde.\nFor riket er ditt og makten og æren i evighet.\nAmen."
							}
						],
						"optional": false,
						"selAlt": 2,
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}L |{{/r}} La oss sammen be Fader vår."
							}
						],
						"selIntro": 0,
						"text": ""
					},
					{
						"id": "gf-14",
						"type": "salme",
						"heading": "14 Salme",
						"text": "",
						"instr": "",
						"alts": [],
						"optional": false,
						"salmeNr": "",
						"salmeTittel": ""
					},
					{
						"id": "gf-15",
						"type": "instruks",
						"heading": "15 Postludium",
						"text": "",
						"instr": "Før postludiet kan det fremføres et musikkinnslag, vokalt eller instrumentalt. Under postludiet bæres kisten ut.",
						"alts": [],
						"optional": true,
						"selAlt": 0
					}
				]
			},
			{
				"title": "Jordpåkastelse",
				"items": [
					{
						"id": "gf-16",
						"type": "instruks",
						"heading": "Gravferd",
						"text": "",
						"instr": "Før ledd 16 Salme plasseres kisten på senkeapparatet eller på planker o.l. over graven og blir stående der inntil ledd 19 Senkning finner sted.\nHvor det er praksis, kan kisten senkes helt ned i graven med en gang før salmen (ledd 16) synges.",
						"alts": [],
						"optional": true,
						"selAlt": 0
					},
					{
						"id": "gf-17",
						"type": "salme",
						"heading": "16 Salme",
						"text": "",
						"instr": "",
						"alts": [],
						"optional": false,
						"salmeNr": "",
						"salmeTittel": ""
					},
					{
						"id": "gf-18",
						"type": "tekst",
						"heading": "17 Skriftlesning",
						"text": "",
						"instr": "En av følgende tekster, som ikke er brukt tidligere i gravferden:",
						"alts": [
							{
								"label": "Sal 68,21",
								"text": "Vår Gud er en Gud som frelser, hos Gud Herren er det utgang fra døden.\nBIBELREF | Sal 68,21"
							},
							{
								"label": "Åp 1,17b-18",
								"text": "Jesus Kristus sier: Frykt ikke!\nJeg er den første og den siste og den levende. Jeg var død, men se, jeg lever i all evighet, og jeg har nøklene til døden og dødsriket. Åp 1,17b-18"
							},
							{
								"label": "Sal 23",
								"text": "En salme av David.\nHerren er min hyrde,\njeg mangler ikke noe.\nHan lar meg ligge i grønne enger,\nhan leder meg til vann der jeg finner hvile.\nHan gir meg nytt liv.\nHan fører meg på rettferdighets stier\nfor sitt navns skyld.\nOm jeg enn skulle vandre i dødsskyggens dal,\nfrykter jeg ikke noe ondt.\nFor du er med meg.\nDin kjepp og din stav,\nde trøster meg.\nDu dekker bord for meg\nlike foran mine fiender.\nDu salver mitt hode med olje.\nMitt beger renner over.\nBare godhet og miskunn\nskal følge meg alle mine dager,\nog jeg skal bo i Herrens hus\ngjennom alle tider.\nBIBELREF | Sal 23"
							},
							{
								"label": "Sal 50,15",
								"text": "Kall på meg på nødens dag,\nså vil jeg utfri deg, og du skal gi meg ære.\nBIBELREF | Sal 50,15"
							},
							{
								"label": "Sal 121",
								"text": "En sang ved festreisene.\nJeg løfter mine øyne mot fjellene.\nHvor skal min hjelp komme fra?\nMin hjelp kommer fra Herren,\nhimmelens og jordens skaper.\nHan vil ikke la din fot vakle,\ndin vokter vil ikke blunde!\nSe, han blunder ikke og sover ikke,\nIsraels vokter.\nHerren er din vokter,\nHerren er din skygge\nved din høyre hånd.\nSolen skal ikke skade deg om dagen,\nheller ikke månen om natten.\nHerren skal bevare deg fra alt ondt.\nHan skal bevare ditt liv.\nHerren skal bevare din utgang og din inngang\nfra nå og til evig tid.\nBIBELREF | Sal 121"
							},
							{
								"label": "Matt 11,28",
								"text": "Kom til meg, alle dere som strever og bærer tunge byrder, og jeg vil gi dere hvile.\nBIBELREF | Matt 11,28"
							},
							{
								"label": "Matt 28,1-10",
								"text": "Da sabbaten var over og det begynte å lysne den første dagen i uken, kom Maria Magdalena og den andre Maria for å se til graven. 2 Med ett ble det et kraftig jordskjelv, for en Herrens engel steg ned fra himmelen, gikk fram og rullet steinen til side og satte seg på den. 3 Han var som et lyn å se til, og drakten var hvit som snø. 4 Vaktene skalv av redsel da de så ham, og de ble liggende som døde. 5 Men engelen tok til orde og sa til kvinnene: «Frykt ikke! Jeg vet at dere leter etter Jesus, den korsfestede. 6 Han er ikke her, han er stått opp, slik som han sa. Kom og se stedet hvor han lå!\nSkynd dere av sted og si til disiplene hans: ‘Han er stått opp fra de døde, og han går i forveien for dere til Galilea; der skal dere få se ham.’ – Nå har jeg sagt dere det.»\nDa skyndte de seg bort fra graven, redde, men jublende glade, og de løp for å fortelle det til disiplene. 9 Og se, Jesus kom mot dem og sa: «Vær hilset!» De gikk fram og omfavnet føttene hans og tilba ham. 10 Jesus sa til dem: «Frykt ikke! Gå og si til mine brødre at de skal dra til Galilea. Der skal de se meg.»\nBIBELREF | Matt 28,1-10"
							},
							{
								"label": "Åp 21,1-5",
								"text": "Og jeg så en ny himmel og en ny jord. For den første himmel og den første jord var borte, og havet fantes ikke mer.\nOg jeg så den hellige byen, det nye Jerusalem, stige ned fra himmelen, fra Gud, gjort i stand og pyntet som en brud for sin brudgom.\nOg jeg hørte fra tronen en høy røst som sa:\n«Se, Guds bolig er hos menneskene.\nHan skal bo hos dem,\nog de skal være hans folk,\nog Gud selv skal være hos dem.\nHan skal være deres Gud.\nHan skal tørke bort hver tåre fra deres øyne,\nog døden skal ikke være mer,\nheller ikke sorg eller skrik eller smerte.\nFor det som en gang var, er borte.»\nHan som sitter på tronen, sa: «Se, jeg gjør alle ting nye.» Og han la til: «Skriv det ned, for dette er troverdige og sanne ord.»\nBIBELREF | Åp 21,1-5"
							}
						],
						"optional": false,
						"selAlt": 2
					},
					{
						"id": "gf-19",
						"type": "tekst",
						"heading": "18 Bønn ved gravstedet",
						"text": "",
						"instr": "I denne bønnen kan liturgen utfylle (navnet nevnes) etter anledningen — for eksempel fullt navn, fornavn, vår kjære, vår venn o.l.",
						"alts": [
							{
								"label": "A",
								"text": "Herre Jesus Kristus, la denne grav være et håpets sted, i troen på deg som stod opp fra de døde."
							},
							{
								"label": "B",
								"text": "Herre Jesus Kristus, du som selv ble lagt i en grav, gi oss å følge deg i oppstandelsen fra de døde."
							},
							{
								"label": "C",
								"text": "Herre Jesus Kristus, la (navnet nevnes) få hvile i fred under korsets tegn til oppstandelsens morgen. Hjelp oss i liv og død å sette vårt håp til deg."
							},
							{
								"label": "D",
								"text": "Herre Jesus Kristus, du som selv ble lagt i en grav, la dette stedet være et fredens sted, hvor (navnet nevnes) får hvile under korsets tegn til dagen da du kaller alle frem fra gravene. Hjelp oss i liv og død å sette vårt håp til deg."
							}
						],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "gf-20",
						"type": "instruks",
						"heading": "19 Senkning",
						"text": "",
						"instr": "Som hovedregel senkes kisten helt ned.",
						"alts": [],
						"optional": true,
						"selAlt": 0
					},
					{
						"id": "gf-21",
						"type": "tekst",
						"heading": "20 Jordpåkastelse",
						"text": "{{r}}P |{{/r}} I Faderens og Sønnens og Den Hellige Ånds navn.\n\n@NOTAT Deretter kaster liturgen tre ganger jord på kisten og sier:\n{{r}}Første gang:{{/r}} Av jord er du kommet.\n{{r}}Andre gang:{{/r}} Til jord skal du bli.\n{{r}}Tredje gang: {{/r}}Av jorden skal du igjen oppstå.",
						"instr": "",
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "gf-22",
						"type": "tekst",
						"heading": "21 Skriftord og velsignelse",
						"text": "",
						"instr": "",
						"alts": [
							{
								"label": "A — Joh 11,25-26",
								"text": "{{r}}L |{{/r}} Vår Herre Jesus Kristus sier: Jeg er oppstandelsen og livet. Den som tror på meg, skal leve om han enn dør. Og hver den som lever og tror på meg, skal aldri i evighet dø.\nBIBELREF | Joh 11,25-26"
							},
							{
								"label": "B — 1 Pet 1,3",
								"text": "{{r}}L |{{/r}} Velsignet er Gud, vår Herre Jesu Kristi Far, han som i sin rike miskunn har født oss på ny til et levende håp ved Jesu Kristi oppstandelse fra de døde!\nBIBELREF | 1 Pet 1,3"
							}
						],
						"optional": false,
						"avslutningAlts": [
							{
								"label": "Velsignelse",
								"text": "{{r}}P |{{/r}} vendt til sørgeskaren\nTa imot velsignelsen.\nHerren velsigne deg og bevare deg.\nHerren la sitt ansikt lyse over deg og være deg nådig.\nHerren løfte sitt åsyn på deg og gi deg fred. ✠"
							}
						],
						"selAlt": 0,
						"selAvsl": 0
					},
					{
						"id": "gf-24",
						"type": "salme",
						"heading": "22 Salme",
						"text": "",
						"instr": "",
						"alts": [],
						"optional": false,
						"salmeNr": "",
						"salmeTittel": ""
					}
				],
				"delGruppe": "gravferd"
			},
			{
				"title": "Jordpåkastelse",
				"items": [
					{
						"id": "gf-25",
						"type": "instruks",
						"heading": "Bisettelse",
						"text": "",
						"instr": "Gravferdshandlingen ovenfor (ledd 1–13) avsluttes med jordpåkastelse (ledd 19–23). Rent unntaksvis kan denne ordningen følges også i kirke/kapell, se Alminnelige bestemmelser punkt 8.",
						"alts": [],
						"optional": true,
						"selAlt": 0
					},
					{
						"id": "gf-26",
						"type": "instruks",
						"heading": "19 Senkning",
						"text": "",
						"instr": "I rom hvor senkning ikke er praktisk mulig, bør kisten føres bort under postludiet.",
						"alts": [],
						"optional": true,
						"selAlt": 0
					},
					{
						"id": "gf-27",
						"type": "tekst",
						"heading": "20 Jordpåkastelse",
						"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den Hellige Ånds navn.\n\n@NOTAT Deretter kaster liturgen tre ganger jord på kisten og sier:\n{{r}}Første gang: {{/r}}Av jord er du kommet.\n{{r}}Andre gang:{{/r}} Til jord skal du bli.\n{{r}}Tredje gang:{{/r}} Av jorden skal du igjen oppstå.",
						"instr": "",
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "gf-28",
						"type": "tekst",
						"heading": "21 Skriftord og velsignelse",
						"text": "",
						"instr": "",
						"alts": [
							{
								"label": "A — Joh 11,25-26",
								"text": "{{r}}L |{{/r}} Vår Herre Jesus Kristus sier: Jeg er oppstandelsen og livet. Den som tror på meg, skal leve om han enn dør. Og hver den som lever og tror på meg, skal aldri i evighet dø.\nBIBELREF | Joh 11,25-26"
							},
							{
								"label": "B — 1 Pet 1,3",
								"text": "{{r}}L |{{/r}} Velsignet er Gud, vår Herre Jesu Kristi Far, han som i sin rike miskunn har født oss på ny til et levende håp ved Jesu Kristi oppstandelse fra de døde!\nBIBELREF | 1 Pet 1,3"
							}
						],
						"optional": false,
						"avslutningAlts": [
							{
								"label": "Velsignelse",
								"text": "{{r}}L |{{/r}} vendt til sørgeskaren\nTa imot velsignelsen.\nHerren velsigne deg og bevare deg.\nHerren la sitt ansikt lyse over deg og være deg nådig.\nHerren løfte sitt åsyn på deg og gi deg fred. ✠"
							}
						],
						"selAlt": 0,
						"selAvsl": 0
					},
					{
						"id": "gf-30",
						"type": "salme",
						"heading": "22 Salme",
						"text": "",
						"instr": "",
						"alts": [],
						"optional": false,
						"salmeNr": "",
						"salmeTittel": ""
					},
					{
						"id": "gf-31",
						"type": "instruks",
						"heading": "23 Postludium",
						"text": "",
						"instr": "I rom hvor senkning ikke er praktisk mulig, bør kisten føres bort under postludiet.",
						"alts": [],
						"optional": true,
						"selAlt": 0
					}
				],
				"delGruppe": "bisettelse"
			}
		],
		"visInstr": true,
		"visRoles": true,
		"visSalmeinfo": true,
		"delGrupper": [
			"gravferd",
			"bisettelse"
		],
		"malForm": "bokmål"
	},
	{
		"id": "forb-borgerlig-ekteskap-2017",
		kategori: "Vigsel",
		oversettelser: ["forbønn-for-borgerlig-inngått-ekteskap-2017-nynorsk"],
		"name": "Forbønn for borgerlig inngått ekteskap (2017)",
		"description": "Ordning for forbønn for borgerlig inngått ekteskap — vedtatt av Kirkemøtet 2017 (KM 06/17).",
		"sections": [
			{
				"title": "1 Preludium/Inngang",
				"items": [
					{
						"id": "forb2017-1",
						"type": "instruks",
						"heading": "1 Preludium/Inngang",
						"instr": "Ordning for Forbønn for borgerlig inngått ekteskap 2017 (KM 06/17).\nI løpet av handlingen kan det gis rom for medvirkning av ulike slag. Det kan være medvirkning fra festfølget ved enkelte av de liturgiske ledd, og det kan være tillegg til handlingen i form av musikk eller høytlesning, eventuelt kombinert med at det tennes lys i lysgloben. Blant de kulturelle innslag kan det også åpnes for elementer som understreker ekteparets etniske bakgrunn. Der den ene part har en annen kirkelig tilhørighet enn Den norske kirke, kan det etter godkjennelse av biskopen åpnes for deltakelse fra vedkommende kirkesamfunn. Både når det gjelder medvirkning fra andre kirkesamfunn og kulturelle innslag, skal disse tilpasses forbønnshandlingens gudstjenestlige karakter og ikke bryte med Den norske kirkes trosgrunnlag.\nInnslag som kommer som tillegg til liturgien, kan plasseres etter ledd 8 Forbønn.\nDer navnene skal nevnes, kan en bruke fullt navn eller fornavn, etter hva som er naturlig i det enkelte tilfelle. I spørsmålene under ledd 7 Framstilling av ekteparet skal det brukes fullt navn.\nOrgelmusikk eller annen egnet musikk til preludium/inngang.\nEkteparet kan ta plass i koret på forhånd, eller de kan gå sammen fram til koret og sette seg på plassene sine.\nDersom det er ønskelig, kan ekteparet, forlovere, liturg og andre gå inn i kirken i prosesjon. Deretter kan det fremføres egnet vokal- eller instrumentalmusikk.",
						"text": "",
						"alts": [],
						"selAlt": 0
					}
				]
			},
			{
				"title": "2 Inngangsord",
				"items": [
					{
						"id": "forb2017-2",
						"type": "tekst",
						"heading": "2 Inngangsord",
						"alts": [
							{
								"label": "A",
								"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den Hellige Ånds navn."
							},
							{
								"label": "B",
								"text": "{{r}}L |{{/r}} Nåde være med dere, og fred fra Gud vår Far og Herren Jesus Kristus."
							},
							{
								"label": "C",
								"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den Hellige Ånds navn: Vår skaper, frigjører og livgiver.\n(Deretter ønskes ekteparet og forsamlingen velkommen med disse eller lignende ord:)\n{{r}}L |{{/r}} Kjære (fullt navn nevnes) og (fullt navn nevnes), den (dato nevnes) inngikk dere ekteskap i (stedet nevnes). Dere er kommet hit (kirken nevnes) fordi dere ønsker kirkens forbønn for deres ekteskap. Vi er samlet for å glede oss med dere og be om Guds velsignelse over dere og over hjemmet deres.\n(Deretter kan liturgen si noe om anledningen og gudstjenesten som følger og eventuelt avslutte slik:)\n(Enten:)\n{{r}}L |{{/r}} Takk Herren, for han er god, evig varer hans miskunn.\nDette er dagen som Herren har gjort;\nla oss juble og glede oss på den!\nBIBELREF | Sal 118,1.24\n(Eller:)\n{{r}}L |{{/r}} Gud er kjærlighet, og den som blir i kjærligheten, blir i Gud og Gud i ham.\nBIBELREF | 1 Joh 4,16b"
							}
						],
						"selAlt": 0,
						"text": ""
					}
				]
			},
			{
				"title": "3 Salme",
				"items": [
					{
						"id": "forb2017-3",
						"type": "salme",
						"heading": "3 Salme",
						"salmeNr": "",
						"salmeTittel": ""
					}
				]
			},
			{
				"title": "4 Skriftlesning - Innledning",
				"items": [
					{
						"id": "forb2017-4",
						"type": "tekst",
						"heading": "4 Skriftlesning",
						"text": "{{r}}L |{{/r}} Gud har skapt oss i sitt bilde\ntil å leve i fellesskap med seg og med hverandre.\nEkteskapet er Guds gode gave.\nÅ leve sammen som ektefeller\ner å leve i tillit og kjærlighet,\ndele gleder og sorger\nog trofast stå ved hverandres side livet ut.\nDet står skrevet i Salmenes bok:\nHvor dyrebar er din kjærlighet, Gud!\nI skyggen av dine vinger søker menneskebarna ly.\nDe får nyte overfloden i ditt hus,\ndu lar dem drikke av din gledes bekk.\nFor hos deg er livets kilde,\ni ditt lys ser vi lys\nBIBELREF | Sal 36, 8-10\nLa oss høre hva Guds ord sier om kjærlighet og troskap:\nKle dere derfor i inderlig medfølelse\nog vær gode, milde, ydmyke og tålmodige,\nså dere bærer over med hverandre og\ntilgir hverandre hvis den ene har noe å bebreide den andre. Som Herren har tilgitt dere, skal dere tilgi hverandre.\nOg over alt dette: Kle dere i kjærlighet,\nsom er båndet som binder sammen\nog gjør fullkommen.\nBIBELREF | Kol 3,12b-14",
						"alts": [],
						"selAlt": 0
					}
				]
			},
			{
				"title": "Skriftlesninger",
				"items": [
					{
						"id": "v2017-15",
						"type": "tekst",
						"heading": "Skriftlesninger ved Vigsels- og forbønnsliturgi 2017",
						"text": "{{r}}L |{{/r}} La oss videre høre fra Guds ord.",
						"instr": "2-4 av de følgende tekster eller andre høvelige skriftlesninger, minst én fra hvert av de to testamentene. Skriftlesningene kan leses av medlemmer av bryllupsfølget. De som skal lese, går samlet frem til lesepulten. Paret og menigheten sitter under lesningen.",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "v2017-16",
						"type": "tekst",
						"heading": "1 Mos 1,27-28a",
						"text": "Det står skrevet i Første Mosebok:\nGud skapte mennesket i sitt bilde, i Guds bilde skapte han det,\ntil mann og kvinne skapte han dem. Gud velsignet dem og sa til dem:\n«Vær fruktbare og bli mange,\nfyll jorden og legg den under dere!»\nBIBELREF | 1 Mos 1,27-28a",
						"alts": [],
						"selAlt": 0,
						"bokstav": "A"
					},
					{
						"id": "v2017-17",
						"type": "tekst",
						"heading": "1 Mos 2,18",
						"text": "Det står skrevet i Første Mosebok:\nDa sa Herren Gud: «Det er ikke godt for mennesket å være alene. Jeg vil lage en hjelper av samme slag.»\nBIBELREF | 1 Mos 2,18",
						"alts": [],
						"selAlt": 0,
						"bokstav": "B"
					},
					{
						"id": "v2017-18",
						"type": "tekst",
						"heading": "Rut 1,16b-17a",
						"text": "Det står skrevet i Ruts bok:\nDit du går, vil jeg gå,\nog hvor du bor, vil jeg bo. Ditt folk er mitt folk,\nog din Gud er min Gud. Der du dør, vil jeg dø,\nog der vil jeg begraves.\nBIBELREF | Rut 1,16b-17a",
						"alts": [],
						"selAlt": 0,
						"bokstav": "C"
					},
					{
						"id": "v2017-19",
						"type": "tekst",
						"heading": "Salme 23",
						"text": "Det står skrevet i Salmenes bok:\nHerren er min hyrde, jeg mangler ikke noe.\nHan lar meg ligge i grønne enger,\nhan leder meg til vann der jeg finner hvile.\nHan gir meg nytt liv.\nHan fører meg på rettferdighets stier for sitt navns skyld.\nOm jeg enn skulle vandre i dødsskyggens dal, frykter jeg ikke noe ondt. For du er med meg. Din kjepp og din stav, de trøster meg.\nDu dekker bord for meg like foran mine fiender. Du salver mitt hode med olje.\nMitt beger renner over. Bare godhet og miskunn skal følge meg alle mine dager, og jeg skal bo i Herrens hus gjennom alle tider.\nBIBELREF | Salme 23",
						"alts": [],
						"selAlt": 0,
						"bokstav": "D"
					},
					{
						"id": "v2017-20",
						"type": "tekst",
						"heading": "Salme 91,1-2.4.9",
						"text": "Det står skrevet i Salmenes bok:\nDen som sitter i skjul hos Den høyeste og finner nattely i skyggen av Den veldige, han sier til Herren: «Min tilflukt og min borg, min Gud som jeg setter min lit til!» Under hans vinger kan du søke ly, han dekker deg med sine fjær.\nHans trofasthet er skjold og vern. «Du, Herre, er min tilflukt.» Den høyeste har du gjort til din bolig.\nBIBELREF | Salme 91,1-2.4.9",
						"alts": [],
						"selAlt": 0,
						"bokstav": "E"
					},
					{
						"id": "v2017-21",
						"type": "tekst",
						"heading": "Sal 100",
						"text": "Det står skrevet i Salmenes bok:\nRop med jubel for Herren, all jorden!\nTjen Herren med glede, kom fram for ham med jubel!\nKjenn at Herren er Gud! Han har skapt oss, vi er hans, vi er hans folk og den flokken han gjeter.\nKom gjennom portene hans med takkesang,\ninn i forgårdene med lovsang! Lov ham, velsign hans navn! Herren er god, evig er hans miskunn, hans trofasthet varer fra slekt til slekt.\nBIBELREF | Sal 100",
						"alts": [],
						"selAlt": 0,
						"bokstav": "F"
					},
					{
						"id": "v2017-22",
						"type": "tekst",
						"heading": "Sal 103,1-5",
						"text": "Det står skrevet i Salmenes bok:\nVelsign Herren, min sjel!\nAlt som i meg er, velsign hans hellige navn.\nVelsign Herren, min sjel! Glem ikke alt det gode han gjør. Han tilgir all din skyld og leger alle dine sykdommer.\nHan frir ditt liv fra graven og kroner deg med barmhjertighet og kjærlighet. Han metter ditt liv med det gode, du blir ung igjen som ørnen.\nBIBELREF | Sal 103,1-5",
						"alts": [],
						"selAlt": 0,
						"bokstav": "G"
					},
					{
						"id": "v2017-23",
						"type": "tekst",
						"heading": "Fork 4,9-10a.12",
						"text": "Det står skrevet i Forkynnerensbok:\nDet er bedre å være to enn én; de får god lønn for sitt strev. For om de faller, kan den ene hjelpe den andre opp.\nOm én blir overvunnet, kan to holde stand.\nEn tretvinnet tråd\nryker ikke så fort.\nBIBELREF | Fork 4,9-10a.12",
						"alts": [],
						"selAlt": 0,
						"bokstav": "H"
					},
					{
						"id": "v2017-24",
						"type": "tekst",
						"heading": "Høys 2,9-10a.13b-14",
						"text": "Det står skrevet i Høysangen:\nMin kjæreste ligner en gasell, en ung hjort.\nDer står han bak muren vår. Han kikker inn gjennom vinduene, gløtter inn gjennom gitteret. Min kjæreste tar til orde og sier: Stå opp, min elskede, min vakre jente, og kom!\nMin due i fjellkløften, i ly under bratte klipper, la meg få se deg, la meg få høre stemmen din!\nFor stemmen er myk og skikkelsen skjønn.\nBIBELREF | Høys 2,9-10a.13b-14",
						"alts": [],
						"selAlt": 0,
						"bokstav": "I"
					},
					{
						"id": "v2017-25",
						"type": "tekst",
						"heading": "Høys 2,8-14.16-17 + 8,6-7a",
						"text": "Det står skrevet i Høysangen:\n(Denne lesningen kan leses av én tekstleser eller av kvinne (I) og mann (II).)\n{{r}}I |{{/r}} Hør, det er min kjæreste, der kommer han, løpende over fjellene, hoppende over høydene. Min kjæreste ligner en gasell, en ung hjort. Der står han bak muren vår. Han kikker inn gjennom vinduene, gløtter inn gjennom gitteret.\nMin kjæreste tar til orde og sier:\n{{r}}II |{{/r}} Stå opp, min elskede, min vakre jente, og kom! Nå er vinteren omme, regnet er forbi, det er borte. Landet dekkes av blomster. Sangens tid er inne, turtelduen kan høres i landet. Frukten på fikentreet modner, blomsten på vinstokken dufter.\nStå opp, min elskede, min vakre jente, og kom!\nMin due i fjellkløften, i ly under bratte klipper, la meg få se deg,\nla meg få høre stemmen din! For stemmen er myk og skikkelsen skjønn.\n{{r}}I |{{/r}} Min kjæreste er min, og jeg er hans, han som gjeter mellom liljene. Helt til dagen blåser skyggene bort, spring som gasellen, min kjæreste, som en ung hjort over kløfter og fjell!\n{{r}}I/II |{{/r}} Sett meg som et segl på ditt hjerte, et stempel på din arm!\nFor kjærligheten er sterk som døden, lidenskapen er ubøyelig som dødsriket. Den brenner som flammende ild, en Herrens brann.\nVeldige vann slukker ikke kjærligheten, elver skyller den ikke bort.\nBIBELREF | Høys 2,8-14.16-17 + 8,6-7a",
						"alts": [],
						"selAlt": 0,
						"bokstav": "J"
					},
					{
						"id": "v2017-26",
						"type": "tekst",
						"heading": "Høys 8,6-7a",
						"text": "Det står skrevet i Høysangen:\nSett meg som et segl på ditt hjerte, et stempel på din arm!\nFor kjærligheten er sterk som døden, lidenskapen er ubøyelig som dødsriket. Den brenner som flammende ild, en Herrens brann.\nVeldige vann slukker ikke kjærligheten, elver skyller den ikke bort.\nBIBELREF | Høys 8,6-7a",
						"alts": [],
						"selAlt": 0,
						"bokstav": "K"
					},
					{
						"id": "v2017-27",
						"type": "tekst",
						"heading": "Matt 5,13-16",
						"text": "Det står skrevet i evangeliet etter Matteus:\nJesus sa: Dere er jordens salt! Men hvis saltet mister sin kraft,\nhvordan skal det da bli gjort til salt igjen? Det duger ikke lenger til noe, men kastes ut og tråkkes ned av menneskene.\nDere er verdens lys! En by som ligger på et fjell, kan ikke skjules. Heller ikke tenner man en oljelampe og setter den under et kar.\nNei, man setter den på en holder, så den lyser for alle i huset.\nSlik skal deres lys skinne for menneskene, så de kan se de gode gjerningene dere gjør, og prise deres Far i himmelen!\nBIBELREF | Matt 5,13-16",
						"alts": [],
						"selAlt": 0,
						"bokstav": "L"
					},
					{
						"id": "v2017-28",
						"type": "tekst",
						"heading": "Matt 6,25-34",
						"text": "Det står skrevet i evangeliet etter Matteus:\nJesus sa: Vær ikke bekymret for livet, hva dere skal spise,\neller hva dere skal drikke, heller ikke for kroppen, hva dere skal kle dere med. Er ikke livet mer enn maten og kroppen mer enn klærne?\nSe på fuglene under himmelen! De sår ikke, de høster ikke og samler ikke i hus,\nmen den Far dere har i himmelen, gir dem føde likevel. Er ikke dere mer verdt enn de? Hvem av dere kan vel med all sin bekymring legge en eneste alen til sin livslengde? Og hvorfor er dere bekymret for klærne? Se på liljene på marken, hvordan de vokser! De strever ikke og spinner ikke, men jeg sier dere: Selv ikke Salomo i all sin prakt var kledd som en av dem. Når Gud kler gresset på marken så fint, det som gror i dag og kastes i ovnen i morgen, hvor mye mer skal han ikke da kle dere – dere lite troende!\nSå gjør dere ikke bekymringer, og si ikke: ‘Hva skal vi spise?' eller: ‘Hva skal vi drikke?' eller: ‘Hva skal vi kle oss med?' Alt dette er hedningene opptatt av.\nMen den Far dere har i himmelen, vet jo at dere trenger alt dette.\nSøk først Guds rike og hans rettferdighet, så skal dere få alt det andre i tillegg.\nSå gjør dere ingen bekymringer for morgendagen; morgendagen skal bekymre seg for seg selv. Hver dag har nok med sin egen plage.\nBIBELREF | Matt 6,25-34",
						"alts": [],
						"selAlt": 0,
						"bokstav": "M"
					},
					{
						"id": "v2017-29",
						"type": "tekst",
						"heading": "Matt 7,7-8.12",
						"text": "Det står skrevet i evangeliet etter Matteus:\nJesus sa: Be, så skal dere få. Let, så skal dere finne.\nBank på, så skal det lukkes opp for dere. For den som ber, han får,\nog den som leter, han finner, og den som banker på, skal det lukkes opp for. Alt dere vil at andre skal gjøre mot dere, det skal også dere gjøre mot dem. For dette er loven og profetene.\nBIBELREF | Matt 7,7-8.12",
						"alts": [],
						"selAlt": 0,
						"bokstav": "N"
					},
					{
						"id": "v2017-30",
						"type": "tekst",
						"heading": "Matt 7,24-25",
						"text": "Det står skrevet i evangeliet etter Matteus:\nJesus sa: Hver den som hører disse mine ord og gjør det de sier, ligner en klok mann som bygde huset sitt på fjell. Regnet styrtet, elvene flommet, og vindene blåste og slo mot huset.\nMen det falt ikke, for det var bygd på fjell.\nBIBELREF | Matt 7,24-25",
						"alts": [],
						"selAlt": 0,
						"bokstav": "O"
					},
					{
						"id": "v2017-31",
						"type": "tekst",
						"heading": "Matt 19,4-6",
						"text": "Det står skrevet i evangeliet etter Matteus:\nJesus sa: Har dere ikke lest at Skaperen fra begynnelsen av skapte dem til mann og kvinne og sa: «Derfor skal mannen forlate sin far og sin mor og holde seg til sin hustru, og de to skal være ett.» Så er de ikke lenger to; deres liv er ett.\nDet som Gud altså har sammenføyd, skal mennesker ikke skille.\nBIBELREF | Matt 19,4-6",
						"alts": [],
						"selAlt": 0,
						"bokstav": "P"
					},
					{
						"id": "v2017-32",
						"type": "tekst",
						"heading": "Joh 13, 34-35",
						"text": "Det står skrevet i evangeliet etter Johannes:\nEt nytt bud gir jeg dere: Dere skal elske hverandre. Som jeg har elsket dere, skal dere elske hverandre. Ved dette skal alle forstå at dere er mine disipler:\nAt dere har kjærlighet til hverandre.\nBIBELREF | Joh 13, 34-35",
						"alts": [],
						"selAlt": 0,
						"bokstav": "Q"
					},
					{
						"id": "v2017-33",
						"type": "tekst",
						"heading": "Joh 15,9-12[-17]",
						"text": "Det står skrevet i evangeliet etter Johannes:\nJesus sa: Som Far har elsket meg, har jeg elsket dere. Bli i min kjærlighet!\nHvis dere holder mine bud, blir dere i min kjærlighet, slik jeg har holdt min Fars bud og blir i hans kjærlighet. Dette har jeg sagt dere for at min glede kan være i dere og deres glede kan bli fullkommen. Og dette er mitt bud:\nDere skal elske hverandre som jeg har elsket dere.\n[Ingen har større kjærlighet enn den som gir livet for vennene sine.\nDere er mine venner hvis dere gjør det jeg befaler dere. Jeg kaller dere ikke lenger tjenere, for tjeneren vet ikke hva herren hans gjør. Jeg kaller dere venner, for jeg har gjort kjent for dere alt jeg har hørt av min Far.\nDere har ikke utvalgt meg, men jeg har utvalgt dere og satt dere til å gå ut og bære frukt, en frukt som varer. Da skal Far gi dere alt dere ber om i mitt navn. Dette er mitt bud til dere: Elsk hverandre!]\nBIBELREF | Joh 15,9-12[-17]",
						"alts": [],
						"selAlt": 0,
						"bokstav": "R"
					},
					{
						"id": "v2017-34",
						"type": "tekst",
						"heading": "Rom 8,38-39",
						"text": "Det står skrevet i Paulus' brev til romerne:\nFor jeg er viss på at verken død eller liv, verken engler eller krefter, verken det som nå er eller det som kommer, eller noen makt, verken det som er i det høye eller i det dype, eller noen annen skapning, skal kunne skille oss fra Guds kjærlighet i Kristus Jesus, vår Herre.\nBIBELREF | Rom 8,38-39",
						"alts": [],
						"selAlt": 0,
						"bokstav": "S"
					},
					{
						"id": "v2017-35",
						"type": "tekst",
						"heading": "1 Kor 13",
						"text": "Det står skrevet i Paulus' første brev til korinterne:\n@NOTAT Kapitlet kan leses i sin helhet eller i utdrag.\nOm jeg taler med menneskers og englers tunger, men ikke har kjærlighet, da er jeg bare drønnende malm eller en klingende bjelle.\nOm jeg har profetisk gave, kjenner alle hemmeligheter og eier all kunnskap, om jeg har all tro så jeg kan flytte fjell, men ikke har kjærlighet, da er jeg intet.\nOm jeg gir alt jeg eier til brød for de fattige, ja, om jeg gir meg selv til å brennes, men ikke har kjærlighet, da har jeg ingen ting vunnet.\nKjærligheten er tålmodig, kjærligheten er velvillig, den misunner ikke, skryter ikke, er ikke hovmodig. Kjærligheten krenker ikke, søker ikke sitt eget, er ikke oppfarende og gjemmer ikke på det onde. Den gleder seg ikke over urett, men har sin glede i sannheten.\nKjærligheten utholder alt, tror alt, håper alt, tåler alt. Kjærligheten tar aldri slutt. Profetgavene skal bli borte, tungene skal tie og kunnskapen forgå.\nFor vi forstår stykkevis og taler profetisk stykkevis. Men når det fullkomne kommer, skal det som er stykkevis, ta slutt. Da jeg var barn, talte jeg som et barn, tenkte jeg som et barn, forsto jeg som et barn. Men da jeg ble voksen, la jeg av det barnslige.\nNå ser vi i et speil, i en gåte, da skal vi se ansikt til ansikt. Nå forstår jeg stykkevis, da skal jeg erkjenne fullt ut, slik Gud kjenner meg fullt ut. Så blir de stående, disse tre: tro, håp og kjærlighet. Men størst blant dem er kjærligheten.\nBIBELREF | 1 Kor 13",
						"alts": [],
						"selAlt": 0,
						"bokstav": "T"
					},
					{
						"id": "v2017-36",
						"type": "tekst",
						"heading": "Gal 3, 26-28",
						"text": "Det står skrevet i Paulus' brev til galaterne:\nFor dere er alle Guds barn ved troen, i Kristus Jesus.\nAlle dere som er døpt til Kristus, har kledd dere i Kristus. Her er ikke jøde eller greker, her er ikke slave eller fri, her er ikke mann og kvinne. Dere er alle én i Kristus Jesus.\nBIBELREF | Gal 3, 26-28",
						"alts": [],
						"selAlt": 0,
						"bokstav": "U"
					},
					{
						"id": "v2017-37",
						"type": "tekst",
						"heading": "Ef 3,14-21",
						"text": "Det står skrevet i Paulus' brev til efeserne:\nDerfor bøyer jeg mine knær for Far, han som har gitt navn til alt som kalles far i himmel og på jord. Må han som er så rik på herlighet, gi deres indre menneske kraft og styrke ved sin Ånd. Må Kristus ved troen bo i deres hjerter og dere stå rotfestet og grunnfestet i kjærlighet. Må dere sammen med alle de hellige bli i stand til å fatte bredden og lengden, høyden og dybden, ja, kjenne Kristi kjærlighet, som overgår all kunnskap. Må dere bli fylt av hele Guds fylde!\nHan som virker i oss med sin kraft og kan gjøre uendelig mye mer enn det vi ber om og forstår, ham være ære i kirken og i Kristus Jesus gjennom alle slekter og evigheter! Amen.\nBIBELREF | Ef 3,14-21",
						"alts": [],
						"selAlt": 0,
						"bokstav": "V"
					},
					{
						"id": "v2017-38",
						"type": "tekst",
						"heading": "Fil 2,1-5",
						"text": "Det står skrevet i Paulus' brev til filipperne:\nOm det da er trøst i Kristus, oppmuntring i kjærligheten, fellesskap i Ånden, om det finnes medfølelse og barmhjertighet, så gjør nå min glede fullkommen: Ha samme sinnelag og samme kjærlighet, vær ett i sjel og sinn.\nGjør ikke noe av selvhevdelse og tom ærgjerrighet, men vær ydmyke og sett de andre høyere enn dere selv. Tenk ikke bare på deres eget beste, men også på de andres. La samme sinnelag være i dere som også var i Kristus Jesus!\nBIBELREF | Fil 2,1-5",
						"alts": [],
						"selAlt": 0,
						"bokstav": "W"
					},
					{
						"id": "v2017-39",
						"type": "tekst",
						"heading": "Fil 4,4-8",
						"text": "Det står skrevet i Paulus' brev til filipperne:\nGled dere alltid i Herren! Igjen vil jeg si: Gled dere!\nLa alle mennesker få merke at dere er vennlige. Herren er nær.\nVær ikke bekymret for noe! Men legg alt dere har på hjertet, fram for Gud. Be og kall på ham med takk. Og Guds fred, som overgår all forstand,\nskal bevare deres hjerter og tanker i Kristus Jesus. Til slutt, søsken: Alt som er sant og edelt, rett og rent, alt som er verdt å elske og akte, alt som er til glede og alt som fortjener ros, legg vinn på det!\nBIBELREF | Fil 4,4-8",
						"alts": [],
						"selAlt": 0,
						"bokstav": "X"
					},
					{
						"id": "v2017-40",
						"type": "tekst",
						"heading": "1 Joh 4,7-12",
						"text": "Det står skrevet i Johannes' første brev:\nMine kjære, la oss elske hverandre! For kjærligheten er fra Gud,\nog hver den som elsker, er født av Gud og kjenner Gud.\nDen som ikke elsker, har aldri kjent Gud, for Gud er kjærlighet.\nOg ved dette ble Guds kjærlighet åpenbart blant oss, at Gud sendte sin enbårne Sønn til verden for at vi skulle leve ved ham.\nJa, dette er kjærligheten, ikke at vi har elsket Gud, men at han har elsket oss\nog sendt sin Sønn til soning for våre synder.\nMine kjære, har Gud elsket oss slik, da skylder også vi å elske hverandre. Ingen har noen gang sett Gud. Men dersom vi elsker hverandre, blir Gud i oss, og hans kjærlighet er fullendt i oss.\nBIBELREF | 1 Joh 4,7-12",
						"instr": "",
						"alts": [],
						"selAlt": 0,
						"bokstav": "Y"
					}
				]
			},
			{
				"title": "5 Salme",
				"items": [
					{
						"id": "forb2017-5",
						"type": "tekst",
						"heading": "5 Salme",
						"instr": "Salmen kan erstattes av egnet vokal- eller instrumentalmusikk.",
						"text": "",
						"alts": [],
						"selAlt": 0
					}
				]
			},
			{
				"title": "6 Tale",
				"items": [
					{
						"id": "forb2017-6",
						"type": "instruks",
						"heading": "6 Tale",
						"instr": "Liturgen holder en tale over et av de skriftordene som er lest under ledd 4 eller over en annen høvelig tekst.",
						"text": "",
						"alts": [],
						"selAlt": 0
					}
				]
			},
			{
				"title": "7 Fremstilling av ekteparet",
				"items": [
					{
						"id": "forb2017-7",
						"type": "tekst",
						"heading": "7 Fremstilling av ekteparet",
						"instr": "Ekteparet går sammen fram til alteret. Liturgen henvender seg først til den som står til venstre.",
						"alts": [
							{
								"label": "A",
								"text": "{{r}}L |{{/r}} For offentlig myndighet har dere lovet å leve sammen i ekteskap. Dette løftet betyr at dere skal være ett og holde trofast sammen i gode og onde dager inntil døden skiller dere.\nEtter deres ønske vil vi i dag be for dere og stille deres ekteskap og hjem inn under Guds velsignelse."
							},
							{
								"label": "B",
								"text": "{{r}}L |{{/r}} (Begges fulle navn uten tittel), dere har for offentlig myndighet lovet å leve sammen i ekteskap. Vil dere fortsatt elske og ære hverandre og holde trofast sammen i gode og onde dager inntil døden skiller dere?\n(Ekteparet svarer, etter hverandre eller sammen:)\nJa.\n{{r}}L |{{/r}} Etter deres ønske vil vi i dag be for dere\nog stille deres ekteskap og hjem inn under Guds velsignelse."
							}
						],
						"selAlt": 0,
						"text": ""
					}
				]
			},
			{
				"title": "8 Forbønn",
				"items": [
					{
						"id": "forb2017-8",
						"type": "tekst",
						"heading": "8 Forbønn",
						"instr": "Liturgen ber for ekteparet med håndspåleggelse en av følgende bønner, som avsluttes med Fadervår.\nEventuelt kan også andre i følget delta i forbønnen med håndspåleggelse.\nHer kan følge.",
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}L |{{/r}} La oss alle be.\n@NOTAT Ekteparet kneler ved alterringen."
							}
						],
						"selIntro": 0,
						"alts": [
							{
								"label": "Forbønn A",
								"text": "{{r}}L |{{/r}} Barmhjertige Gud, vi ber deg for NN og NN og deres ekteskap: La din velsignelse hvile over dem som her kneler for ditt ansikt. Fyll dem med din kjærlighet, og bygg deres hjem i fred.\nSe til dem i nåde, og styrk dem med din Ånd, så de i gode og onde dager setter sin lit til deg, holder trofast sammen og hjelper hverandre fram mot det evige liv."
							},
							{
								"label": "Forbønn B",
								"text": "L | Gode Gud, vi takker deg for (navnet nevnes) og (navnet nevnes) og for deres kjærlighet til hverandre. Velsign deres liv som ektefolk.\nHjelp dem å holde de løfter de har gitt hverandre, så deres ekteskap kan fylles av tillit, omsorg og glede.\nGi dem evne og vilje til å bygge sitt hjem i fred, så det blir et sted der [barn kan vokse opp i trygghet og] familie og venner kan finne fellesskap.\nDu som er veien, sannheten og livet, la dem få vandre i din sannhet. Du som tilgir og leger, hjelp dem å tilgi hverandre. Du som er kjærlighetens kilde, gi dem og alle ektefolk å vokse og modnes i kjærlighet."
							},
							{
								"label": "Alt",
								"text": "@NOTAT Her kan det tilføyes en fritt utformet bønn, eventuelt kombinert med lystenning.\n@NOTAT Eventuelt kan menigheten synge en bønnesalme (mens ekteparet kneler). Se for eksempel Norsk Salmebok 2013 nr 431, 624, 638, 652, 653, 678, 680."
							}
						],
						"selAlt": 0,
						"avslutningAlts": [
							{
								"label": "Fadervår 2017",
								"text": "{{r}}L |{{/r}} La oss sammen be Fadervår:\n{{r}}A |{{/r}} Vår Far i himmelen!\nLa navnet ditt helliges.\nLa riket ditt komme.\nLa viljen din skje på jorden slik som i himmelen.\nGi oss i dag vårt daglige brød,\nog tilgi oss vår skyld,\nslik også vi tilgir våre skyldnere.\nOg la oss ikke komme i fristelse,\nmen frels oss fra det onde.\nFor riket er ditt,\nog makten og æren i evighet.\nAmen.\n(Ekteparet setter seg på plassene sine.)"
							},
							{
								"label": "Fadervår 1977",
								"text": "{{r}}L |{{/r}} La oss sammen be Fadervår:\n{{r}}A |{{/r}} Fader vår, du som er i himmelen.\nLa ditt navn holdes hellig.\nLa ditt rike komme.\nLa din vilje skje på jorden som i himmelen.\nGi oss i dag vårt daglige brød.\nForlat oss vår skyld,\nsom vi òg forlater våre skyldnere.\nLed oss ikke inn i fristelse,\nmen frels oss fra det onde.\nFor riket er ditt,\nog makten og æren i evighet.\nAmen\n(Ekteparet setter seg på plassene sine.)"
							}
						],
						"selAvsl": 0,
						"text": ""
					}
				]
			},
			{
				"title": "9 Musikk/symbolhandlinger",
				"items": [
					{
						"id": "forb2017-9",
						"type": "instruks",
						"heading": "9 Musikk/symbolhandlinger",
						"instr": "Deltakere i festfølget og andre kan medvirke med musikk, høytlesning eller andre kulturelle innslag.",
						"text": "",
						"alts": [],
						"selAlt": 0
					}
				]
			},
			{
				"title": "10 Salme",
				"items": [
					{
						"id": "forb2017-10",
						"type": "salme",
						"heading": "10 Salme",
						"salmeNr": "",
						"salmeTittel": ""
					}
				]
			},
			{
				"title": "11 Velsignelse",
				"items": [
					{
						"id": "forb2017-11",
						"type": "tekst",
						"heading": "11 Velsignelse",
						"alts": [
							{
								"label": "A",
								"text": "@NOTAT L vendt mot menigheten.\n{{r}}L | {{/r}}La oss prise Herren.\n@NOTAT Menigheten reiser seg (M).\n{{r}}M |{{/r}} Gud være lovet. Halleluja. Halleluja. Halleluja.\n{{r}}L |{{/r}} Herren velsigne deg og bevare deg.\nHerren la sitt ansikt lyse over deg og være deg nådig. Herren løfte sitt åsyn på deg og gi deg fred. ✝\n{{r}}M |{{/r}} Amen. Amen. Amen."
							},
							{
								"label": "B",
								"text": "@NOTAT L vendt mot menigheten.\n{{r}}L | {{/r}}Ta imot velsignelsen.\n@NOTAT Menigheten reiser seg.\n{{r}}L |{{/r}} Herren velsigne deg og bevare deg.\nHerren la sitt ansikt lyse over deg og være deg nådig. Herren løfte sitt åsyn på deg og gi deg fred. ✝\n{{r}}M |{{/r}} Amen."
							}
						],
						"selAlt": 0,
						"text": ""
					}
				]
			},
			{
				"title": "12 Postludium/Utgang",
				"items": [
					{
						"id": "forb2017-12",
						"type": "instruks",
						"heading": "12 Postludium/Utgang",
						"instr": "Orgelmusikk eller annen egnet musikk. Ekteparet går sammen ut av kirken.",
						"text": "",
						"alts": [],
						"selAlt": 0
					}
				]
			}
		],
		"erOriginal": true,
		"liturgiType": "vigsel",
		"visInstr": true,
		"visRoles": true,
		"visSalmeinfo": true,
		"malForm": "bokmål"
	},
	{
		"id": "vigsel-2017",
		kategori: "Vigsel",
		oversettelser: ["vigsel-2017-nynorsk"],
	skriftlesningKilde: "Skriftlesninger ved Vigsels- og forbønnsliturgi 2017",
		"name": "Vigsel (2017)",
		"description": "Ordning for vigsel med alminnelige bestemmelser — vedtatt av Kirkemøtet 2017. Inkluderer skriftlesninger for vigsels- og forbønnsliturgien.",
		"sections": [
			{
				"title": "Bestemmelser",
				"items": [
					{
						"id": "v2017-1",
						"type": "instruks",
						"heading": "Bestemmelser",
						"instr": "Vedtatt av Kirkemøtet 2017, 30. januar\n1 Ekteskap inngås ved at to personer offentlig, i vitners nærvær og for godkjent (borgerlig eller kirkelig) myndighet avgir løfte til hverandre om at de vil leve sammen i ekteskap, og dette erklæres å ha offentlig gyldighet.\n2 Ekteskapsinngåelse etter kirkens ordning har både en juridisk og en kirkelig side. Den handling som er ekteskapsstiftende etter samfunnets lovgivning, foretas for Guds ansikt, og er derfor en kirkelig handling av gudstjenestlig karakter. Enkeltelementer ved handlingen, som musikk, opplesning og andre innslag må utformes i samsvar med dette.\n3 Handlingen finner sted i kirken eller et annet gudstjenestested som etter biskopens avgjørelse kan brukes til vigsel.\n4 Før handlingen har den som skal forrette – unntaksvis en annen på dennes vegne – en samtale med paret som skal vies.\n5 Salmer og sanger må på forhånd godkjennes av forrettende prest og det musikalske stoff av kantor/organist.\n6 Vigsel kan bekjentgjøres på forhånd gjennom kunngjøringene i en gudstjeneste, og paret kan nevnes i forbønnen.\n7 Hvis en vil feire bryllupsmesse, følger en enten ordningen Vigsel til og med siste salme. Denne blir da salme før nattverden, etterfulgt av en av nattverdbønnene i Gudstjenesteboken. Alternativt kan en følge Ordning for hovedgudstjeneste. Vigselordningens Inngangsord erstatter da hovedgudstjenestens Inngangord, og vigselsordningens ledd 4 Skriftlesning erstatter lesningene i hovedgudstjenesten. En av lesningene skal være en evangelielesning. Leddene Ekteskapsinngåelse og Overrekkelse av ringer kommer på kunngjøringenes plass, og vigselsordningens ledd 9 Forbønn erstatter hovedgudstjenestens forbønnsdel.\nEn kunngjør i Inngangsordene at det skal feires bryllupsmesse, for eksempel slik:\nL: Kjære (navnet nevnes) og (navnet nevnes). Dere er kommet hit til (kirken nevnes) for å inngå ekteskap. Vi er samlet her for å glede oss med dere. Vi skal høre deres løfter til hverandre og be om Guds velsignelse over dere og over hjemmet deres. Dere har også bedt om å få del i Herrens nattverd når dere nå begynner livet sammen som ektefolk.\nVi vil derfor feire denne handlingen som en bryllupsmesse, slik at det er mulig for dem som ønsker det, å gå sammen med dere til nattverd på denne dagen.\n8 Ektepar som har inngått ekteskap for borgerlig myndighet, kan siden anmode om kirkens forbønn. Se ordningen Forbønn for borgerlig inngått ekteskap 2017.\n9 Det kan ringes i ca. 5 minutter før og etter vigselshandlingen.\n10 Liturgen bærer stola i hvitt\nI løpet av handlingen kan det gis rom for medvirkning av ulike slag. Det kan være medvirkning fra bryllupsfølget ved enkelte av de liturgiske ledd, og det kan være tillegg til handlingen i form av musikk eller høytlesning, eventuelt kombinert med at det tennes lys i lysgloben. Blant de kulturelle innslag kan det også åpnes for elementer som understreker parets etniske bakgrunn. Der den ene part har en annen kirkelig tilhørighet enn Den norske kirke, kan det etter godkjennelse av biskopen åpnes for deltakelse fra vedkommende kirkesamfunn.\nBåde når det gjelder medvirkning fra andre kirkesamfunn og kulturelle innslag, skal disse tilpasses vigselshandlingens gudstjenestlige karakter og ikke bryte med Den norske kirkes trosgrunnlag.\nInnslag som kommer som tillegg til liturgien, kan plasseres etter ledd 9 Forbønn.\nDer navnene skal nevnes, kan en bruke fullt navn eller fornavn, etter hva som er naturlig i det enkelte tilfelle. I spørsmålene under ledd 7 Ekteskapsinngåelse skal det brukes fullt navn.",
						"text": "",
						"alts": [],
						"selAlt": 0
					}
				]
			},
			{
				"title": "1 Preludium/Inngang",
				"items": [
					{
						"id": "v2017-2",
						"type": "instruks",
						"heading": "1 Preludium/Inngang",
						"instr": "Orgelmusikk eller annen egnet musikk til preludium/inngang.\nDe som skal vies kan gå sammen fram til koret og sette seg på sine plasser.\nDersom det er ønskelig, kan paret, en eller begge, forlovere, representant(er) for familiene, liturg og andre gå inn i kirken i prosesjon.\nDeretter kan det fremføres egnet vokal- eller instrumentalmusikk.",
						"text": "",
						"alts": [],
						"selAlt": 0
					}
				]
			},
			{
				"title": "2 Inngangsord",
				"items": [
					{
						"id": "v2017-3",
						"type": "tekst",
						"heading": "2 Inngangsord",
						"introAlts": [
							{
								"label": "Innledning",
								"text": "@NOTAT Deretter ønskes paret og forsamlingen velkommen med disse eller lignende ord:\nDeretter kan liturgen si:"
							}
						],
						"selIntro": 0,
						"alts": [
							{
								"label": "A",
								"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den hellige ånds navn."
							},
							{
								"label": "B",
								"text": "{{r}}L |{{/r}} Nåde være med dere, og fred fra Gud vår Far og Herren Jesus Kristus."
							},
							{
								"label": "C",
								"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den hellige ånds navn: Vår skaper, frigjører og livgiver."
							}
						],
						"selAlt": 0,
						"text": "",
						"avslutningAlts": [
							{
								"label": "Sal 118,1.24",
								"text": "{{r}}L |{{/r}} Takk Herren, for han er god, evig varer hans miskunn.\nDette er dagen som Herren har gjort;\nla oss juble og glede oss på den!\nBIBELREF | Sal 118,1.24"
							},
							{
								"label": "1 Joh 4,16b",
								"text": "{{r}}L |{{/r}} Gud er kjærlighet, og den som blir i kjærligheten, blir i Gud og Gud i ham.\nBIBELREF | 1 Joh 4,16b"
							}
						],
						"selAvsl": 0
					}
				]
			},
			{
				"title": "3 Salme",
				"items": [
					{
						"id": "v2017-4",
						"type": "salme",
						"heading": "3 Salme",
						"salmeNr": "",
						"salmeTittel": ""
					}
				]
			},
			{
				"title": "4 Skriftlesning",
				"items": [
					{
						"id": "v2017-5",
						"type": "tekst",
						"heading": "4 Skriftlesning",
						"text": "{{r}}L |{{/r}} Gud har skapt oss i sitt bilde\ntil å leve i fellesskap med seg og med hverandre. Ekteskapet er Guds gode gave.\nÅ leve sammen som ektefeller er å leve i tillit og kjærlighet, dele gleder og sorger\nog trofast stå ved hverandres side livet ut.\nDet står skrevet i Salmenes bok:\nHvor dyrebar er din kjærlighet, Gud!\nI skyggen av dine vinger søker menneskebarna ly. De får nyte overfloden i ditt hus, du lar dem drikke av din gledes bekk. For hos deg er livets kilde,\ni ditt lys ser vi lys\nBIBELREF | Sal 36, 8-10\nLa oss høre hva Guds ord sier om kjærlighet og troskap:\nKle dere derfor i inderlig medfølelse\nog vær gode, milde, ydmyke og tålmodige, så dere bærer over med hverandre og\ntilgir hverandre hvis den ene har noe å bebreide den andre. Som Herren har tilgitt dere, skal dere tilgi hverandre. Og over alt dette: Kle dere i kjærlighet, som er båndet som binder sammen og gjør fullkommen.\nBIBELREF | Kol 3,12b-14\n{{r}}L |{{/r}} La oss videre høre fra Guds ord.",
						"instr": "2-4 av de følgende tekster (se s 11 i dokumentet), eller andre høvelige skriftlesninger, minst én fra hvert av de to testamentene.\nSkriftlesningene kan leses av medlemmer av bryllupsfølget. De som skal lese, går samlet frem til lesepulten.\nParet som skal vies og menigheten sitter under lesningen. Siste lesning avsluttes med: «Slik lyder Herrens ord.»",
						"alts": [],
						"selAlt": 0
					}
				]
			},
			{
				"title": "Skriftlesninger ved Vigsels- og forbønnsliturgi 2017",
				"items": [
					{
						"id": "v2017-15",
						"type": "tekst",
						"heading": "Skriftlesninger ved Vigsels- og forbønnsliturgi 2017",
						"text": "{{r}}L |{{/r}} La oss videre høre fra Guds ord.",
						"instr": "2-4 av de følgende tekster eller andre høvelige skriftlesninger, minst én fra hvert av de to testamentene. Skriftlesningene kan leses av medlemmer av bryllupsfølget. De som skal lese, går samlet frem til lesepulten. Paret og menigheten sitter under lesningen.",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "v2017-16",
						"type": "tekst",
						"heading": "1 Mos 1,27-28a",
						"text": "Det står skrevet i Første Mosebok:\nGud skapte mennesket i sitt bilde, i Guds bilde skapte han det,\ntil mann og kvinne skapte han dem. Gud velsignet dem og sa til dem:\n«Vær fruktbare og bli mange,\nfyll jorden og legg den under dere!»\nBIBELREF | 1 Mos 1,27-28a",
						"alts": [],
						"selAlt": 0,
						"bokstav": "A"
					},
					{
						"id": "v2017-17",
						"type": "tekst",
						"heading": "1 Mos 2,18",
						"text": "Det står skrevet i Første Mosebok:\nDa sa Herren Gud: «Det er ikke godt for mennesket å være alene. Jeg vil lage en hjelper av samme slag.»\nBIBELREF | 1 Mos 2,18",
						"alts": [],
						"selAlt": 0,
						"bokstav": "B"
					},
					{
						"id": "v2017-18",
						"type": "tekst",
						"heading": "Rut 1,16b-17a",
						"text": "Det står skrevet i Ruts bok:\nDit du går, vil jeg gå,\nog hvor du bor, vil jeg bo. Ditt folk er mitt folk,\nog din Gud er min Gud. Der du dør, vil jeg dø,\nog der vil jeg begraves.\nBIBELREF | Rut 1,16b-17a",
						"alts": [],
						"selAlt": 0,
						"bokstav": "C"
					},
					{
						"id": "v2017-19",
						"type": "tekst",
						"heading": "Salme 23",
						"text": "Det står skrevet i Salmenes bok:\nHerren er min hyrde, jeg mangler ikke noe.\nHan lar meg ligge i grønne enger,\nhan leder meg til vann der jeg finner hvile.\nHan gir meg nytt liv.\nHan fører meg på rettferdighets stier for sitt navns skyld.\nOm jeg enn skulle vandre i dødsskyggens dal, frykter jeg ikke noe ondt. For du er med meg. Din kjepp og din stav, de trøster meg.\nDu dekker bord for meg like foran mine fiender. Du salver mitt hode med olje.\nMitt beger renner over. Bare godhet og miskunn skal følge meg alle mine dager, og jeg skal bo i Herrens hus gjennom alle tider.\nBIBELREF | Salme 23",
						"alts": [],
						"selAlt": 0,
						"bokstav": "D"
					},
					{
						"id": "v2017-20",
						"type": "tekst",
						"heading": "Salme 91,1-2.4.9",
						"text": "Det står skrevet i Salmenes bok:\nDen som sitter i skjul hos Den høyeste og finner nattely i skyggen av Den veldige, han sier til Herren: «Min tilflukt og min borg, min Gud som jeg setter min lit til!» Under hans vinger kan du søke ly, han dekker deg med sine fjær.\nHans trofasthet er skjold og vern. «Du, Herre, er min tilflukt.» Den høyeste har du gjort til din bolig.\nBIBELREF | Salme 91,1-2.4.9",
						"alts": [],
						"selAlt": 0,
						"bokstav": "E"
					},
					{
						"id": "v2017-21",
						"type": "tekst",
						"heading": "Sal 100",
						"text": "Det står skrevet i Salmenes bok:\nRop med jubel for Herren, all jorden!\nTjen Herren med glede, kom fram for ham med jubel!\nKjenn at Herren er Gud! Han har skapt oss, vi er hans, vi er hans folk og den flokken han gjeter.\nKom gjennom portene hans med takkesang,\ninn i forgårdene med lovsang! Lov ham, velsign hans navn! Herren er god, evig er hans miskunn, hans trofasthet varer fra slekt til slekt.\nBIBELREF | Sal 100",
						"alts": [],
						"selAlt": 0,
						"bokstav": "F"
					},
					{
						"id": "v2017-22",
						"type": "tekst",
						"heading": "Sal 103,1-5",
						"text": "Det står skrevet i Salmenes bok:\nVelsign Herren, min sjel!\nAlt som i meg er, velsign hans hellige navn.\nVelsign Herren, min sjel! Glem ikke alt det gode han gjør. Han tilgir all din skyld og leger alle dine sykdommer.\nHan frir ditt liv fra graven og kroner deg med barmhjertighet og kjærlighet. Han metter ditt liv med det gode, du blir ung igjen som ørnen.\nBIBELREF | Sal 103,1-5",
						"alts": [],
						"selAlt": 0,
						"bokstav": "G"
					},
					{
						"id": "v2017-23",
						"type": "tekst",
						"heading": "Fork 4,9-10a.12",
						"text": "Det står skrevet i Forkynnerensbok:\nDet er bedre å være to enn én; de får god lønn for sitt strev. For om de faller, kan den ene hjelpe den andre opp.\nOm én blir overvunnet, kan to holde stand.\nEn tretvinnet tråd\nryker ikke så fort.\nBIBELREF | Fork 4,9-10a.12",
						"alts": [],
						"selAlt": 0,
						"bokstav": "H"
					},
					{
						"id": "v2017-24",
						"type": "tekst",
						"heading": "Høys 2,9-10a.13b-14",
						"text": "Det står skrevet i Høysangen:\nMin kjæreste ligner en gasell, en ung hjort.\nDer står han bak muren vår. Han kikker inn gjennom vinduene, gløtter inn gjennom gitteret. Min kjæreste tar til orde og sier: Stå opp, min elskede, min vakre jente, og kom!\nMin due i fjellkløften, i ly under bratte klipper, la meg få se deg, la meg få høre stemmen din!\nFor stemmen er myk og skikkelsen skjønn.\nBIBELREF | Høys 2,9-10a.13b-14",
						"alts": [],
						"selAlt": 0,
						"bokstav": "I"
					},
					{
						"id": "v2017-25",
						"type": "tekst",
						"heading": "Høys 2,8-14.16-17 + 8,6-7a",
						"text": "Det står skrevet i Høysangen:\n(Denne lesningen kan leses av én tekstleser eller av kvinne (I) og mann (II).)\n{{r}}I |{{/r}} Hør, det er min kjæreste, der kommer han, løpende over fjellene, hoppende over høydene. Min kjæreste ligner en gasell, en ung hjort. Der står han bak muren vår. Han kikker inn gjennom vinduene, gløtter inn gjennom gitteret.\nMin kjæreste tar til orde og sier:\n{{r}}II |{{/r}} Stå opp, min elskede, min vakre jente, og kom! Nå er vinteren omme, regnet er forbi, det er borte. Landet dekkes av blomster. Sangens tid er inne, turtelduen kan høres i landet. Frukten på fikentreet modner, blomsten på vinstokken dufter.\nStå opp, min elskede, min vakre jente, og kom!\nMin due i fjellkløften, i ly under bratte klipper, la meg få se deg,\nla meg få høre stemmen din! For stemmen er myk og skikkelsen skjønn.\n{{r}}I |{{/r}} Min kjæreste er min, og jeg er hans, han som gjeter mellom liljene. Helt til dagen blåser skyggene bort, spring som gasellen, min kjæreste, som en ung hjort over kløfter og fjell!\n{{r}}I/II |{{/r}} Sett meg som et segl på ditt hjerte, et stempel på din arm!\nFor kjærligheten er sterk som døden, lidenskapen er ubøyelig som dødsriket. Den brenner som flammende ild, en Herrens brann.\nVeldige vann slukker ikke kjærligheten, elver skyller den ikke bort.\nBIBELREF | Høys 2,8-14.16-17 + 8,6-7a",
						"alts": [],
						"selAlt": 0,
						"bokstav": "J"
					},
					{
						"id": "v2017-26",
						"type": "tekst",
						"heading": "Høys 8,6-7a",
						"text": "Det står skrevet i Høysangen:\nSett meg som et segl på ditt hjerte, et stempel på din arm!\nFor kjærligheten er sterk som døden, lidenskapen er ubøyelig som dødsriket. Den brenner som flammende ild, en Herrens brann.\nVeldige vann slukker ikke kjærligheten, elver skyller den ikke bort.\nBIBELREF | Høys 8,6-7a",
						"alts": [],
						"selAlt": 0,
						"bokstav": "K"
					},
					{
						"id": "v2017-27",
						"type": "tekst",
						"heading": "Matt 5,13-16",
						"text": "Det står skrevet i evangeliet etter Matteus:\nJesus sa: Dere er jordens salt! Men hvis saltet mister sin kraft,\nhvordan skal det da bli gjort til salt igjen? Det duger ikke lenger til noe, men kastes ut og tråkkes ned av menneskene.\nDere er verdens lys! En by som ligger på et fjell, kan ikke skjules. Heller ikke tenner man en oljelampe og setter den under et kar.\nNei, man setter den på en holder, så den lyser for alle i huset.\nSlik skal deres lys skinne for menneskene, så de kan se de gode gjerningene dere gjør, og prise deres Far i himmelen!\nBIBELREF | Matt 5,13-16",
						"alts": [],
						"selAlt": 0,
						"bokstav": "L"
					},
					{
						"id": "v2017-28",
						"type": "tekst",
						"heading": "Matt 6,25-34",
						"text": "Det står skrevet i evangeliet etter Matteus:\nJesus sa: Vær ikke bekymret for livet, hva dere skal spise,\neller hva dere skal drikke, heller ikke for kroppen, hva dere skal kle dere med. Er ikke livet mer enn maten og kroppen mer enn klærne?\nSe på fuglene under himmelen! De sår ikke, de høster ikke og samler ikke i hus,\nmen den Far dere har i himmelen, gir dem føde likevel. Er ikke dere mer verdt enn de? Hvem av dere kan vel med all sin bekymring legge en eneste alen til sin livslengde? Og hvorfor er dere bekymret for klærne? Se på liljene på marken, hvordan de vokser! De strever ikke og spinner ikke, men jeg sier dere: Selv ikke Salomo i all sin prakt var kledd som en av dem. Når Gud kler gresset på marken så fint, det som gror i dag og kastes i ovnen i morgen, hvor mye mer skal han ikke da kle dere – dere lite troende!\nSå gjør dere ikke bekymringer, og si ikke: ‘Hva skal vi spise?' eller: ‘Hva skal vi drikke?' eller: ‘Hva skal vi kle oss med?' Alt dette er hedningene opptatt av.\nMen den Far dere har i himmelen, vet jo at dere trenger alt dette.\nSøk først Guds rike og hans rettferdighet, så skal dere få alt det andre i tillegg.\nSå gjør dere ingen bekymringer for morgendagen; morgendagen skal bekymre seg for seg selv. Hver dag har nok med sin egen plage.\nBIBELREF | Matt 6,25-34",
						"alts": [],
						"selAlt": 0,
						"bokstav": "M"
					},
					{
						"id": "v2017-29",
						"type": "tekst",
						"heading": "Matt 7,7-8.12",
						"text": "Det står skrevet i evangeliet etter Matteus:\nJesus sa: Be, så skal dere få. Let, så skal dere finne.\nBank på, så skal det lukkes opp for dere. For den som ber, han får,\nog den som leter, han finner, og den som banker på, skal det lukkes opp for. Alt dere vil at andre skal gjøre mot dere, det skal også dere gjøre mot dem. For dette er loven og profetene.\nBIBELREF | Matt 7,7-8.12",
						"alts": [],
						"selAlt": 0,
						"bokstav": "N"
					},
					{
						"id": "v2017-30",
						"type": "tekst",
						"heading": "Matt 7,24-25",
						"text": "Det står skrevet i evangeliet etter Matteus:\nJesus sa: Hver den som hører disse mine ord og gjør det de sier, ligner en klok mann som bygde huset sitt på fjell. Regnet styrtet, elvene flommet, og vindene blåste og slo mot huset.\nMen det falt ikke, for det var bygd på fjell.\nBIBELREF | Matt 7,24-25",
						"alts": [],
						"selAlt": 0,
						"bokstav": "O"
					},
					{
						"id": "v2017-31",
						"type": "tekst",
						"heading": "Matt 19,4-6",
						"text": "Det står skrevet i evangeliet etter Matteus:\nJesus sa: Har dere ikke lest at Skaperen fra begynnelsen av skapte dem til mann og kvinne og sa: «Derfor skal mannen forlate sin far og sin mor og holde seg til sin hustru, og de to skal være ett.» Så er de ikke lenger to; deres liv er ett.\nDet som Gud altså har sammenføyd, skal mennesker ikke skille.\nBIBELREF | Matt 19,4-6",
						"alts": [],
						"selAlt": 0,
						"bokstav": "P"
					},
					{
						"id": "v2017-32",
						"type": "tekst",
						"heading": "Joh 13, 34-35",
						"text": "Det står skrevet i evangeliet etter Johannes:\nEt nytt bud gir jeg dere: Dere skal elske hverandre. Som jeg har elsket dere, skal dere elske hverandre. Ved dette skal alle forstå at dere er mine disipler:\nAt dere har kjærlighet til hverandre.\nBIBELREF | Joh 13, 34-35",
						"alts": [],
						"selAlt": 0,
						"bokstav": "Q"
					},
					{
						"id": "v2017-33",
						"type": "tekst",
						"heading": "Joh 15,9-12[-17]",
						"text": "Det står skrevet i evangeliet etter Johannes:\nJesus sa: Som Far har elsket meg, har jeg elsket dere. Bli i min kjærlighet!\nHvis dere holder mine bud, blir dere i min kjærlighet, slik jeg har holdt min Fars bud og blir i hans kjærlighet. Dette har jeg sagt dere for at min glede kan være i dere og deres glede kan bli fullkommen. Og dette er mitt bud:\nDere skal elske hverandre som jeg har elsket dere.\n[Ingen har større kjærlighet enn den som gir livet for vennene sine.\nDere er mine venner hvis dere gjør det jeg befaler dere. Jeg kaller dere ikke lenger tjenere, for tjeneren vet ikke hva herren hans gjør. Jeg kaller dere venner, for jeg har gjort kjent for dere alt jeg har hørt av min Far.\nDere har ikke utvalgt meg, men jeg har utvalgt dere og satt dere til å gå ut og bære frukt, en frukt som varer. Da skal Far gi dere alt dere ber om i mitt navn. Dette er mitt bud til dere: Elsk hverandre!]\nBIBELREF | Joh 15,9-12[-17]",
						"alts": [],
						"selAlt": 0,
						"bokstav": "R"
					},
					{
						"id": "v2017-34",
						"type": "tekst",
						"heading": "Rom 8,38-39",
						"text": "Det står skrevet i Paulus' brev til romerne:\nFor jeg er viss på at verken død eller liv, verken engler eller krefter, verken det som nå er eller det som kommer, eller noen makt, verken det som er i det høye eller i det dype, eller noen annen skapning, skal kunne skille oss fra Guds kjærlighet i Kristus Jesus, vår Herre.\nBIBELREF | Rom 8,38-39",
						"alts": [],
						"selAlt": 0,
						"bokstav": "S"
					},
					{
						"id": "v2017-35",
						"type": "tekst",
						"heading": "1 Kor 13",
						"text": "Det står skrevet i Paulus' første brev til korinterne:\n@NOTAT Kapitlet kan leses i sin helhet eller i utdrag.\nOm jeg taler med menneskers og englers tunger, men ikke har kjærlighet, da er jeg bare drønnende malm eller en klingende bjelle.\nOm jeg har profetisk gave, kjenner alle hemmeligheter og eier all kunnskap, om jeg har all tro så jeg kan flytte fjell, men ikke har kjærlighet, da er jeg intet.\nOm jeg gir alt jeg eier til brød for de fattige, ja, om jeg gir meg selv til å brennes, men ikke har kjærlighet, da har jeg ingen ting vunnet.\nKjærligheten er tålmodig, kjærligheten er velvillig, den misunner ikke, skryter ikke, er ikke hovmodig. Kjærligheten krenker ikke, søker ikke sitt eget, er ikke oppfarende og gjemmer ikke på det onde. Den gleder seg ikke over urett, men har sin glede i sannheten.\nKjærligheten utholder alt, tror alt, håper alt, tåler alt. Kjærligheten tar aldri slutt. Profetgavene skal bli borte, tungene skal tie og kunnskapen forgå.\nFor vi forstår stykkevis og taler profetisk stykkevis. Men når det fullkomne kommer, skal det som er stykkevis, ta slutt. Da jeg var barn, talte jeg som et barn, tenkte jeg som et barn, forsto jeg som et barn. Men da jeg ble voksen, la jeg av det barnslige.\nNå ser vi i et speil, i en gåte, da skal vi se ansikt til ansikt. Nå forstår jeg stykkevis, da skal jeg erkjenne fullt ut, slik Gud kjenner meg fullt ut. Så blir de stående, disse tre: tro, håp og kjærlighet. Men størst blant dem er kjærligheten.\nBIBELREF | 1 Kor 13",
						"alts": [],
						"selAlt": 0,
						"bokstav": "T"
					},
					{
						"id": "v2017-36",
						"type": "tekst",
						"heading": "Gal 3, 26-28",
						"text": "Det står skrevet i Paulus' brev til galaterne:\nFor dere er alle Guds barn ved troen, i Kristus Jesus.\nAlle dere som er døpt til Kristus, har kledd dere i Kristus. Her er ikke jøde eller greker, her er ikke slave eller fri, her er ikke mann og kvinne. Dere er alle én i Kristus Jesus.\nBIBELREF | Gal 3, 26-28",
						"alts": [],
						"selAlt": 0,
						"bokstav": "U"
					},
					{
						"id": "v2017-37",
						"type": "tekst",
						"heading": "Ef 3,14-21",
						"text": "Det står skrevet i Paulus' brev til efeserne:\nDerfor bøyer jeg mine knær for Far, han som har gitt navn til alt som kalles far i himmel og på jord. Må han som er så rik på herlighet, gi deres indre menneske kraft og styrke ved sin Ånd. Må Kristus ved troen bo i deres hjerter og dere stå rotfestet og grunnfestet i kjærlighet. Må dere sammen med alle de hellige bli i stand til å fatte bredden og lengden, høyden og dybden, ja, kjenne Kristi kjærlighet, som overgår all kunnskap. Må dere bli fylt av hele Guds fylde!\nHan som virker i oss med sin kraft og kan gjøre uendelig mye mer enn det vi ber om og forstår, ham være ære i kirken og i Kristus Jesus gjennom alle slekter og evigheter! Amen.\nBIBELREF | Ef 3,14-21",
						"alts": [],
						"selAlt": 0,
						"bokstav": "V"
					},
					{
						"id": "v2017-38",
						"type": "tekst",
						"heading": "Fil 2,1-5",
						"text": "Det står skrevet i Paulus' brev til filipperne:\nOm det da er trøst i Kristus, oppmuntring i kjærligheten, fellesskap i Ånden, om det finnes medfølelse og barmhjertighet, så gjør nå min glede fullkommen: Ha samme sinnelag og samme kjærlighet, vær ett i sjel og sinn.\nGjør ikke noe av selvhevdelse og tom ærgjerrighet, men vær ydmyke og sett de andre høyere enn dere selv. Tenk ikke bare på deres eget beste, men også på de andres. La samme sinnelag være i dere som også var i Kristus Jesus!\nBIBELREF | Fil 2,1-5",
						"alts": [],
						"selAlt": 0,
						"bokstav": "W"
					},
					{
						"id": "v2017-39",
						"type": "tekst",
						"heading": "Fil 4,4-8",
						"text": "Det står skrevet i Paulus' brev til filipperne:\nGled dere alltid i Herren! Igjen vil jeg si: Gled dere!\nLa alle mennesker få merke at dere er vennlige. Herren er nær.\nVær ikke bekymret for noe! Men legg alt dere har på hjertet, fram for Gud. Be og kall på ham med takk. Og Guds fred, som overgår all forstand,\nskal bevare deres hjerter og tanker i Kristus Jesus. Til slutt, søsken: Alt som er sant og edelt, rett og rent, alt som er verdt å elske og akte, alt som er til glede og alt som fortjener ros, legg vinn på det!\nBIBELREF | Fil 4,4-8",
						"alts": [],
						"selAlt": 0,
						"bokstav": "X"
					},
					{
						"id": "v2017-40",
						"type": "tekst",
						"heading": "1 Joh 4,7-12",
						"text": "Det står skrevet i Johannes' første brev:\nMine kjære, la oss elske hverandre! For kjærligheten er fra Gud,\nog hver den som elsker, er født av Gud og kjenner Gud.\nDen som ikke elsker, har aldri kjent Gud, for Gud er kjærlighet.\nOg ved dette ble Guds kjærlighet åpenbart blant oss, at Gud sendte sin enbårne Sønn til verden for at vi skulle leve ved ham.\nJa, dette er kjærligheten, ikke at vi har elsket Gud, men at han har elsket oss\nog sendt sin Sønn til soning for våre synder.\nMine kjære, har Gud elsket oss slik, da skylder også vi å elske hverandre. Ingen har noen gang sett Gud. Men dersom vi elsker hverandre, blir Gud i oss, og hans kjærlighet er fullendt i oss.\nBIBELREF | 1 Joh 4,7-12",
						"instr": "",
						"alts": [],
						"selAlt": 0,
						"bokstav": "Y"
					}
				]
			},
			{
				"title": "5 Salme",
				"items": [
					{
						"id": "v2017-6",
						"type": "salme",
						"heading": "5 Salme",
						"instr": "Salmen kan erstattes av egnet vokal- eller instrumentalmusikk.",
						"text": ""
					}
				]
			},
			{
				"title": "6 Tale",
				"items": [
					{
						"id": "v2017-7",
						"type": "instruks",
						"heading": "6 Tale",
						"instr": "Liturgen holder en tale over et av de skriftordene som er lest under ledd 4 eller over en annen høvelig tekst.",
						"text": "",
						"alts": [],
						"selAlt": 0
					}
				]
			},
			{
				"title": "7 Ekteskapsinngåelse",
				"items": [
					{
						"id": "v2017-8",
						"type": "tekst",
						"heading": "7 Ekteskapsinngåelse",
						"instr": "Paret går fram til alterringen. Liturgen henvender seg først til den som står til venstre.\nDeretter følger:",
						"alts": [
							{
								"label": "Kort",
								"text": "{{r}}L |{{/r}} For Gud vår Skapers ansikt og i disse vitners nærvær spør jeg deg, (fullt navn uten tittel): Vil du ha (fullt navn uten tittel), som står ved din side, til din ektefelle?\n@NOTAT Svar:\nJa.\n\n{{r}}L |{{/r}} Vil du elske og ære ham/henne/NN\nog bli trofast hos ham/henne/NN\ni gode og onde dager inntil døden skiller dere?\n@NOTAT Svar:\nJa.\n\n{{r}}L |{{/r}} Likeså spør jeg deg, (fullt navn uten tittel):\nVil du ha (fullt navn uten tittel), som står ved din side, til din ektefelle?\n@NOTAT Svar:\nJa.\n\n{{r}}L |{{/r}} Vil du elske og ære ham/henne/NN\nog bli trofast hos ham/henne/NN\ni gode og onde dager inntil døden skiller dere?\n@NOTAT Svar:\nJa.\n\n{{r}}L |{{/r}} Så gi hverandre hånden på det.\n@NOTAT Paret vender seg mot hverandre og gir hverandre høyre hånd. Liturgen legger sin hånd på parets hender.\n{{r}}L |{{/r}} For Guds ansikt og i disse vitners nærvær\nhar dere nå lovet hverandre at dere vil leve sammen i ekteskap, og gitt hverandre hånden på det.\nDerfor erklærer jeg at dere er rette ektefolk."
							},
							{
								"label": "Lang",
								"text": "{{r}}L |{{/r}} For Gud vår Skapers ansikt og i disse vitners nærvær spør jeg deg, (fullt navn uten tittel):\nVil du ha (fullt navn uten tittel),\nsom står ved din side, til din ektefelle?\n@NOTAT Svar:\nJa.\n\n{{r}}L |{{/r}} Likeså spør jeg deg, (fullt navn uten tittel):\nVil du ha (fullt navn uten tittel), som står ved din side, til din ektefelle?\n@NOTAT Svar:\nJa.\n\n{{r}}L |{{/r}} Gjenta etter meg.\n@NOTAT Paret vender seg til hverandre. De gir hverandre høyre hånd og blir stående slik mens de avgir løftet. Liturgen leser løftet ledd for led (L) , deretter fremsier paret det, den ene først (P).\n{{r}}L |{{/r}} Jeg tar deg (navnet nevnes) til min ektefelle.\n{{r}}P |{{/r}} Jeg tar deg (navnet nevnes) til min ektefelle.\n{{r}}L |{{/r}} Jeg vil elske og ære deg\n{{r}}P |{{/r}} Jeg vil elske og ære deg\n{{r}}L |{{/r}} og bli trofast hos deg i gode og onde dager\n{{r}}P |{{/r}} og bli trofast hos deg i gode og onde dager\n{{r}}L |{{/r}} inntil døden skiller oss.\n{{r}}P |{{/r}} inntil døden skiller oss.\n@NOTAT Deretter gjentas løfteavleggelsen på samme måte av den andre.\n@NOTAT Liturgen legger sin hånd på parets hender.\n{{r}}L |{{/r}} For Guds ansikt og i disse vitners nærvær har dere nå lovet hverandre at dere vil leve sammen i ekteskap, og gitt hverandre hånden på det.\nDerfor erklærer jeg at dere er rette ektefolk."
							}
						],
						"selAlt": 0,
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}L |{{/r}} Kom nå fram til Herrens alter, så vi kan høre deres løfter til hverandre og be om Guds velsignelse over dere og over hjemmet deres."
							}
						],
						"selIntro": 0,
						"text": ""
					}
				]
			},
			{
				"title": "8 Overrekkelse av ringer",
				"items": [
					{
						"id": "v2017-9",
						"type": "tekst",
						"heading": "8 Overrekkelse av ringer",
						"instr": "Ringen settes så på fingeren til den andre.\nDeretter gjentas overrekkelsen på samme måte av den andre ektefellen.",
						"alts": [
							{
								"label": "Kort",
								"text": "{{r}}L |{{/r}} Gi nå hverandre ringene, som dere skal bære til tegn på løftet om troskap.\n@NOTAT Hver av dem setter ringen på fingeren til den andre."
							},
							{
								"label": "Lang",
								"text": "{{r}}L |{{/r}} Gi nå hverandre ringene, som dere skal bære til tegn på løftet dere har gitt hverandre.\nGjenta etter meg.\n@NOTAT \n\n@NOTAT Liturgen (L) leser ordene ledd for ledd, deretter fremsier ekteparet dem, den ene først (P).\n{{r}}L |{{/r}} (Navnet), jeg gir deg denne ring\n{{r}}P |{{/r}} (Navnet), jeg gir deg denne ring\n{{r}}L |{{/r}} som et tegn på mitt løfte om kjærlighet og troskap.\n{{r}}P |{{/r}} som et tegn på mitt løfte om kjærlighet og troskap."
							}
						],
						"selAlt": 0,
						"text": ""
					}
				]
			},
			{
				"title": "9 Forbønn",
				"items": [
					{
						"id": "v2017-10",
						"type": "tekst",
						"heading": "9 Forbønn",
						"instr": "Ekteparet kneler ved alterringen.\nLiturgen ber for paret med håndspåleggelse en av følgende bønner, som avsluttes med Fadervår.\nEventuelt kan også andre i følget delta i forbønnen med håndspåleggelse.\nHer kan det tilføyes en fritt utformet bønn, eventuelt kombinert med lystenning. Eventuelt kan menigheten synge en bønnesalme (mens ekteparet kneler).\nSe for eksempel Norsk Salmebok 2013 nr 431, 624, 638, 652, 653, 678, 680.\nForbønnen avsluttes alltid med Fadervår.\nDet er også anledning til å benytte Fadervår etter 1920- eller 1977- liturgien.\nFadervår fra 1978 finner du her\nFadervår fra 1930 finner du her\nEkteparet setter seg på plassene sine.",
						"alts": [
							{
								"label": "A",
								"text": "{{r}}L |{{/r}} Barmhjertige Gud, vi ber deg for (navnet nevnes) og (navnet nevnes) og deres ekteskap: La din velsignelse hvile over dem som her kneler for ditt ansikt.\nFyll dem med din kjærlighet, og bygg deres hjem i fred.\nSe til dem i nåde, og styrk dem med din Ånd, så de i gode og onde dager setter sin lit til deg, holder trofast sammen og hjelper hverandre fram mot det evige liv."
							},
							{
								"label": "B",
								"text": "{{r}}L |{{/r}} Gode Gud, vi takker deg for (navnet nevnes) og (navnet nevnes) og for deres kjærlighet til hverandre. Velsign deres liv som ektefolk.\nHjelp dem å holde de løfter de har gitt hverandre, så deres ekteskap kan fylles av tillit, omsorg og glede.\nGi dem evne og vilje til å bygge sitt hjem i fred, så det blir et sted der [barn kan vokse opp i trygghet og] familie og venner kan finne fellesskap.\nDu som er veien, sannheten og livet, la dem få vandre i din sannhet. Du som tilgir og leger, hjelp dem å tilgi hverandre. Du som er kjærlighetens kilde, gi dem og alle ektefolk å vokse og modnes i kjærlighet."
							}
						],
						"selAlt": 0,
						"avslutningAlts": [
							{
								"label": "Fadervår",
								"text": "{{r}}L |{{/r}} La oss sammen be Fadervår:\n{{r}}A |{{/r}} Vår Far i himmelen!\nLa navnet ditt helliges.\nLa riket ditt komme.\nLa viljen din skje på jorden slik som i himmelen.\nGi oss i dag vårt daglige brød,\nog tilgi oss vår skyld,\nslik også vi tilgir våre skyldnere.\nOg la oss ikke komme i fristelse,\nmen frels oss fra det onde.\nFor riket er ditt,\nog makten og æren i evighet.\nAmen."
							}
						],
						"selAvsl": 0,
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}L |{{/r}} La oss alle be."
							}
						],
						"selIntro": 0,
						"text": ""
					}
				]
			},
			{
				"title": "10 Musikk/symbolfortellinger",
				"items": [
					{
						"id": "v2017-11",
						"type": "instruks",
						"heading": "10 Musikk/symbolfortellinger",
						"instr": "Deltakere i bryllupsfølget og andre kan medvirke med musikk, høytlesning eller andre kulturelle innslag.",
						"alts": [],
						"selAlt": 0,
						"text": ""
					}
				]
			},
			{
				"title": "11 Salme",
				"items": [
					{
						"id": "v2017-12",
						"type": "salme",
						"heading": "11 Salme",
						"text": ""
					}
				]
			},
			{
				"title": "12 Velsignelse",
				"items": [
					{
						"id": "v2017-13",
						"type": "tekst",
						"heading": "12 Velsignelse",
						"instr": "Under den følgende stille bønn kan en klemte tre ganger tre bønneslag med en av kirkens klokker.\nHer kan det også fremføres egnet vokal- eller instrumentalmusikk.",
						"alts": [
							{
								"label": "La oss prise Herren",
								"text": "@NOTAT L, vendt mot menigheten.\n{{r}}L |{{/r}} La oss prise Herren.\n@NOTAT Menigheten reiser seg.\n{{r}}M |{{/r}} Gud være lovet. Halleluja. Halleluja. Halleluja.\n{{r}}L |{{/r}} Herren velsigne deg og bevare deg.\nHerren la sitt ansikt lyse over deg og være deg nådig. \nHerren løfte sitt åsyn på deg og gi deg fred. ✠\n{{r}}M |{{/r}} Amen. Amen. Amen."
							},
							{
								"label": "Ta imot velsignelsen",
								"text": "@NOTAT L, vendt mot menigheten.\n{{r}}L |{{/r}} Ta imot velsignelsen.\n@NOTAT Menigheten reiser seg.\n{{r}}L |{{/r}} Herren velsigne deg og bevare deg.\nHerren la sitt ansikt lyse over deg og være deg nådig. \nHerren løfte sitt åsyn på deg og gi deg fred. ✠\n{{r}}M |{{/r}} Amen."
							}
						],
						"selAlt": 1,
						"text": ""
					}
				]
			},
			{
				"title": "13 Utgang",
				"items": [
					{
						"id": "v2017-14",
						"type": "instruks",
						"heading": "13 Utgang",
						"instr": "Orgelmusikk eller annen egnet musikk. Ekteparet går sammen ut av kirken.",
						"text": "",
						"alts": [],
						"selAlt": 0
					}
				]
			}
		],
		"erOriginal": true,
		"visInstr": true,
		"visRoles": true,
		"visSalmeinfo": true,
		"malForm": "bokmål"
	},
	{
		"id": "vigsel-2003",
		kategori: "Vigsel",
		oversettelser: ["vigsel-2003-nynorsk"],
	skriftlesningKilde: "Skriftlesninger ved Vigsels- og forbønnsliturgi 2003",
		"name": "Vigsel (2003)",
		"description": "Ordning for vigsel med alminnelige bestemmelser — vedtatt av Kirkemøtet 2002, i bruk fra mars 2003. Inkluderer skriftlesninger.",
		"sections": [
			{
				"title": "Bestemmelser",
				"items": [
					{
						"id": "v2003-1",
						"type": "instruks",
						"heading": "Bestemmelser",
						"instr": "Ordning for Vigsel 2003.\nEkteskap inngås ved at kvinne og mann offentlig, i vitners nærvær og for godkjent (borgerlig eller kirkelig) myndighet avgir løfte til hverandre om at de vil leve sammen i ekteskap, og dette erklæres å ha offentlig gyldighet.\nEkteskapsinngåelse etter kirkens ordning har både en juridisk og en kirkelig side. Den handling som er ekteskapsstiftende etter samfunnets lovgivning, foretas for Guds ansikt, og er derfor en kirkelig handling av gudstjenestlig karakter. Enkeltelementer ved handlingen, som musikk, opplesning og andre innslag må utformes i samsvar med dette.\nHandlingen finner sted i kirken eller et annet gudstjenestested som etter biskopens avgjørelse kan brukes til vigsel.\nFør handlingen har den som skal forrette – unntaksvis en annen på dennes vegne – en samtale med brudeparet.\nSalmer og sanger må på forhånd godkjennes av forrettende prest og det musikalske stoff av kantor/organist.\nDen forestående vigsel bør på forhånd bekjentgjøres gjennom kunngjøringene i en gudstjeneste, og brudeparet nevnes i forbønnen.\nHvis en vil feire bryllupsmesse, kan en følge ordningen Vigsel til og med siste salme. Denne blir da salme før nattverden, etterfulgt av en av nattverdbønnene i Gudstjenesteboken. Alternativt kan en følge Ordning for hovedgudstjeneste. Vigselordningens Inngangsord erstatter da hovedgudstjenestens Inngangsord, og vigselsordningens ledd 4 Skriftlesning erstatter lesningene i hovedgudstjenesten. En av lesningene skal være en evangelielesning. Leddene Ekteskapsinngåelse og Overrekkelse av ringer kommer på kunngjøringenes plass, og vigselsordningens ledd 9 Forbønn erstatter hovedgudstjenestens forbønnsdel.\nEn kunngjør i Inngangsordene at det skal feires bryllupsmesse, for eksempel slik:\nL Kjære (navnet nevnes) og (navnet nevnes). Dere er kommet hit til (kirken nevnes) for å inngå ekteskap. Vi er samlet her for å glede oss med dere. Vi skal høre deres løfter til hverandre og be om Guds velsignelse over dere og over hjemmet deres. Dere har også bedt om å få del i Herrens nattverd når dere nå begynner livet sammen som ektefolk.\nVi vil derfor feire denne handlingen som en bryllupsmesse, slik at det er mulig for dem som ønsker det, å gå sammen med dere til nattverd på denne dagen.\nEktepar som har inngått ekteskap for borgerlig myndighet, kan siden anmode om kirkens forbønn. Se ordningen Forbønn for borgerlig inngått ekteskap.\nDet kan ringes i ca. 5 minutter før og etter vigselshandlingen.\nLiturgen bærer stola i hvitt.\nI løpet av handlingen kan det gis rom for medvirkning av ulike slag. Det kan være medvirkning fra bryllupsfølget ved enkelte av de liturgiske ledd, og det kan være tillegg til handlingen i form av musikk eller høytlesning, eventuelt kombinert med at det tennes lys i lysgloben. Blant de kulturelle innslag kan det også åpnes for elementer som understreker brudeparets etniske bakgrunn. Der den ene part har en annen kirkelig tilhørighet enn Den norske kirke, kan det etter godkjennelse av biskopen åpnes for deltakelse fra vedkommende kirkesamfunn.\nBåde når det gjelder medvirkning fra andre kirkesamfunn og kulturelle innslag, skal disse tilpasses vigselshandlingens gudstjenestelige karakter og ikke bryte med Den norske kirkes trosgrunnlag.\nInnslag som kommer som tillegg til liturgien, kan plasseres etter ledd 9 Forbønn.\nDer navnene skal nevnes, kan en bruke fullt navn eller fornavn, etter hva som er naturlig i det enkelte tilfelle. I spørsmålene under ledd 7 Ekteskapsinngåelse skal det brukes fullt navn.",
						"text": "",
						"alts": [],
						"selAlt": 0
					}
				]
			},
			{
				"title": "1 Preludium/Inngang",
				"items": [
					{
						"id": "v2003-2",
						"type": "instruks",
						"heading": "1 Preludium/Inngang",
						"instr": "Orgelmusikk eller annen egnet musikk til preludium/inngang. Brudeparet kan gå sammen fram til koret og sette seg på sine plasser. Dersom det er ønskelig, kan brudeparet, en eller begge, forlovere, representant(er) for familiene, liturg og andre gå inn i kirken i prosesjon.\nDeretter kan det framføres egnet vokal- eller instrumentalmusikk.",
						"text": "",
						"alts": [],
						"selAlt": 0
					}
				]
			},
			{
				"title": "2 Inngangsord",
				"items": [
					{
						"id": "v2003-3",
						"type": "tekst",
						"heading": "2 Inngangsord",
						"alts": [
							{
								"label": "A",
								"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den hellige ånds navn."
							},
							{
								"label": "B",
								"text": "{{r}}L |{{/r}} Nåde være med dere, og fred fra Gud vår Far og Herren Jesus Kristus."
							},
							{
								"label": "C",
								"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den hellige ånds navn: Vår skaper, frigjører og livgiver."
							}
						],
						"selAlt": 0,
						"avslutningAlts": [
							{
								"label": "Sal 36,8-10",
								"text": "{{r}}L |{{/r}} Hvor dyrebar er din kjærlighet, Gud!\nI skyggen av dine vinger søker menneskebarna ly. De får nyte overfloden i ditt hus,\ndu lar dem drikke av din gledes bekk. For hos deg er livets kilde,\ni ditt lys ser vi lys.\nBIBELREF | Sal 36,8-10"
							},
							{
								"label": "Sal 118,1.24",
								"text": "{{r}}L |{{/r}} Takk Herren, for han er god, evig varer hans miskunn.\nDette er dagen som Herren har gjort;\nla oss juble og glede oss på den!\nBIBELREF | Sal 118,1.24"
							},
							{
								"label": "1 Joh 4,16b",
								"text": "{{r}}L |{{/r}} Gud er kjærlighet,\nog den som blir i kjærligheten, blir i Gud og Gud i ham.\nBIBELREF | 1 Joh 4,16b"
							}
						],
						"selAvsl": 0,
						"introAlts": [
							{
								"label": "Innledning",
								"text": "@NOTAT Deretter ønskes brudeparet og forsamlingen velkommen med disse eller lignende ord:\n{{r}}L |{{/r}} Kjære (navnet nevnes) og (navnet nevnes). Dere er kommet hit til (kirken nevnes) for å inngå ekteskap. Vi er samlet her for å glede oss med dere. Vi skal høre deres løfter til hverandre og be om Guds velsignelse over dere og over hjemmet deres.\n@NOTAT Deretter kan liturgen si:"
							}
						],
						"selIntro": 0,
						"text": ""
					}
				]
			},
			{
				"title": "3 Salme",
				"items": [
					{
						"id": "v2003-4",
						"type": "salme",
						"heading": "3 Salme",
						"salmeNr": "",
						"salmeTittel": ""
					}
				]
			},
			{
				"title": "4 Skriftlesning",
				"items": [
					{
						"id": "v2003-5",
						"type": "tekst",
						"heading": "4 Skriftlesning",
						"instr": "2-4 av de følgende tekstene (se s 11 i dokumentet) eller andre høvelige skriftlesninger, minst én fra hvert av de to testamentene.\nSkriftlesningene kan leses av medlemmer av bryllupsfølget. De som skal lese, går samlet frem til lesepulten.\nBrudepar og menighet sitter under lesningen. Siste lesning avsluttes med:\nHer kan følge",
						"text": "{{r}}L |{{/r}} Gud har skapt oss til å leve i fellesskap med seg og med hverandre.\nHan har ordnet det slik at mann og kvinne skal være ett og stadfestet dette fellesskapet med sin velsignelse.\nEkteskapet er Guds gode gave.\nÅ leve sammen som mann og kvinne er å leve i tillit og kjærlighet,\ndele gleder og sorger\nog trofast stå ved hverandres side livet ut.\nGuds ord vitner om ekteskapet at det er hellig og ukrenkelig.\nDet står skrevet i Første Mosebok:\nGud skapte mennesket i sitt bilde, i Guds bilde skapte han det,\nsom mann og kvinne skapte han dem. Gud velsignet dem og sa til dem:\n«Vær fruktbare og bli mange,\nfyll jorden og legg den under dere!»\nBIBELREF | 1 Mos 1,27-28a\nOg vår Herre Jesus Kristus sier:\nHar dere ikke lest at Skaperen fra begynnelsen av skapte dem som mann og kvinne og sa:\n«Derfor skal mannen forlate far og mor\nog holde fast ved sin kvinne, og de to skal være én kropp.»\nSå er de ikke lenger to; de er én kropp. Og det som Gud har sammenføyd, skal mennesker ikke skille.\nBIBELREF | Matt 19,4-6\n{{r}}L |{{/r}} La oss videre høre fra Guds ord.\nSlik lyder Herrens ord.",
						"alts": [],
						"selAlt": 0
					}
				]
			},
			{
				"title": "Skriftlesninger ved Vigsels- og forbønnsliturgi 2003",
				"items": [
					{
						"id": "v2003-15",
						"type": "tekst",
						"heading": "Skriftlesninger ved Vigsels- og forbønnsliturgi 2003",
						"instr": "2-4 av de følgende tekster eller andre høvelige skriftlesninger, minst én fra hvert av de to testamentene. Skriftlesningene kan leses av medlemmer av bryllupsfølget. De som skal lese, går samlet frem til lesepulten. Paret og menigheten sitter under lesningen.",
						"text": "{{r}}L |{{/r}} La oss videre høre fra Guds ord.",
						"alts": [],
						"selAlt": 0
					},
					{
						"id": "v2003-16",
						"type": "tekst",
						"heading": "Salme 23",
						"text": "Det står skrevet i Salmenes bok:\nHerren er min hyrde, jeg mangler ikke noe.\nHan lar meg ligge i grønne enger,\nhan leder meg til vann der jeg finner hvile. Han gir meg nytt liv.\nHan fører meg på rettferdighets stier for sitt navns skyld.\nOm jeg enn skulle vandre i dødsskyggens dal, frykter jeg ikke noe ondt. For du er med meg.\nDin kjepp og din stav, de trøster meg.\nDu dekker bord for meg like foran mine fiender. Du salver mitt hode med olje.\nMitt beger renner over. Bare godhet og miskunn skal følge meg alle mine dager, og jeg skal bo i Herrens hus gjennom alle tider.\nBIBELREF | Salme 23",
						"alts": [],
						"selAlt": 0,
						"bokstav": "A"
					},
					{
						"id": "v2003-17",
						"type": "tekst",
						"heading": "Sal 36, 6-10",
						"text": "Det står skrevet i Salmenes bok:\nHerre, til himmelen rekker din miskunn, din trofasthet når til skyene.\nDin rettferd er som mektige fjell,\nsom det store havdyp er dine dommer.\nHerre, du berger både mennesker og dyr.\nHvor dyrebar er din kjærlighet, Gud!\nI skyggen av dine vinger søker menneskebarna ly. De får nyte overfloden i ditt hus,\ndu lar dem drikke av din gledes bekk.\nFor hos deg er livets kilde,\ni ditt lys ser vi lys.\nBIBELREF | Sal 36, 6-10",
						"alts": [],
						"selAlt": 0,
						"bokstav": "B"
					},
					{
						"id": "v2003-18",
						"type": "tekst",
						"heading": "Salme 91,1-2.4.9",
						"text": "Det står skrevet i Salmenes bok:\nDen som sitter i skjul hos Den høyeste og finner nattely i skyggen av Den veldige, han sier til Herren: «Min tilflukt og min borg, min Gud som jeg setter min lit til!» Under hans vinger kan du søke ly, han dekker deg med sine fjær.\nHans trofasthet er skjold og vern. «Du, Herre, er min tilflukt.» Den høyeste har du gjort til din bolig.\nBIBELREF | Salme 91,1-2.4.9",
						"alts": [],
						"selAlt": 0,
						"bokstav": "C"
					},
					{
						"id": "v2003-19",
						"type": "tekst",
						"heading": "Sal 100",
						"text": "Det står skrevet i Salmenes bok:\nRop med jubel for Herren, all jorden!\nTjen Herren med glede, kom fram for ham med jubel!\nKjenn at Herren er Gud! Han har skapt oss, vi er hans, vi er hans folk og den flokken han gjeter.\nKom gjennom portene hans med takkesang,\ninn i forgårdene med lovsang! Lov ham, velsign hans navn! Herren er god, evig er hans miskunn,\nhans trofasthet varer fra slekt til slekt.\nBIBELREF | Sal 100",
						"alts": [],
						"selAlt": 0,
						"bokstav": "D"
					},
					{
						"id": "v2003-20",
						"type": "tekst",
						"heading": "Sal 103,1-5",
						"text": "Det står skrevet i Salmenes bok:\nVelsign Herren, min sjel!\nAlt som i meg er, velsign hans hellige navn.\nVelsign Herren, min sjel! Glem ikke alt det gode han gjør. Han tilgir all din skyld og leger alle dine sykdommer.\nHan frir ditt liv fra graven og kroner deg med barmhjertighet og kjærlighet. Han metter ditt liv med det gode, du blir ung igjen som ørnen.\nBIBELREF | Sal 103,1-5",
						"alts": [],
						"selAlt": 0,
						"bokstav": "E"
					},
					{
						"id": "v2003-21",
						"type": "tekst",
						"heading": "Høys 2,9-10a.13b-14",
						"text": "Det står skrevet i Høysangen:\nMin kjæreste ligner en gasell, en ung hjort.\nDer står han bak muren vår. Han kikker inn gjennom vinduene, gløtter inn gjennom gitteret. Min kjæreste tar til orde og sier: Stå opp, min elskede, min vakre jente, og kom!\nMin due i fjellkløften, i ly under bratte klipper, la meg få se deg, la meg få høre stemmen din!\nFor stemmen er myk og skikkelsen skjønn.\nBIBELREF | Høys 2,9-10a.13b-14",
						"alts": [],
						"selAlt": 0,
						"bokstav": "F"
					},
					{
						"id": "v2003-22",
						"type": "tekst",
						"heading": "Høys 2,8-14.16-17 + 8,6-7a",
						"text": "Det står skrevet i Høysangen:\n(Denne lesningen kan leses av én tekstleser eller av kvinne (I) og mann (II).)\n{{r}}I |{{/r}} Hør, det er min kjæreste, der kommer han, løpende over fjellene, hoppende over høydene.\nMin kjæreste ligner en gasell, en ung hjort. Der står han bak muren vår. Han kikker inn gjennom vinduene, gløtter inn gjennom gitteret.\nMin kjæreste tar til orde og sier:\n{{r}}II |{{/r}} Stå opp, min elskede, min vakre jente, og kom! Nå er vinteren omme, regnet er forbi, det er borte.\nLandet dekkes av blomster. Sangens tid er inne, turtelduen kan høres i landet. Frukten på fikentreet modner, blomsten på vinstokken dufter.\nStå opp, min elskede, min vakre jente, og kom!\nMin due i fjellkløften, i ly under bratte klipper, la meg få se deg,\nla meg få høre stemmen din! For stemmen er myk og skikkelsen skjønn.\n{{r}}I |{{/r}} Min kjæreste er min, og jeg er hans, han som gjeter mellom liljene. Helt til dagen blåser skyggene bort, spring som gasellen, min kjæreste, som en ung hjort over kløfter og fjell!\n{{r}}I/II |{{/r}} Sett meg som et segl på ditt hjerte, et stempel på din arm!\nFor kjærligheten er sterk som døden, lidenskapen er ubøyelig som dødsriket. Den brenner som flammende ild, en Herrens brann.\nVeldige vann slukker ikke kjærligheten, elver skyller den ikke bort.\nBIBELREF | Høys 2,8-14.16-17 + 8,6-7a",
						"alts": [],
						"selAlt": 0,
						"bokstav": "G"
					},
					{
						"id": "v2003-23",
						"type": "tekst",
						"heading": "Høys 8,6-7a",
						"text": "Det står skrevet i Høysangen:\nSett meg som et segl på ditt hjerte, et stempel på din arm!\nFor kjærligheten er sterk som døden, lidenskapen er ubøyelig som dødsriket. Den brenner som flammende ild, en Herrens brann.\nVeldige vann slukker ikke kjærligheten, elver skyller den ikke bort.\nBIBELREF | Høys 8,6-7a",
						"alts": [],
						"selAlt": 0,
						"bokstav": "H"
					},
					{
						"id": "v2003-24",
						"type": "tekst",
						"heading": "Matt 5,13-16",
						"text": "Det står skrevet i evangeliet etter Matteus:\nJesus sa: Dere er jordens salt! Men hvis saltet mister sin kraft,\nhvordan skal det da bli gjort til salt igjen? Det duger ikke lenger til noe, men kastes ut og tråkkes ned av menneskene.\nDere er verdens lys! En by som ligger på et fjell, kan ikke skjules. Heller ikke tenner man en oljelampe og setter den under et kar.\nNei, man setter den på en holder, så den lyser for alle i huset.\nSlik skal deres lys skinne for menneskene, så de kan se de gode gjerningene dere gjør, og prise deres Far i himmelen!\nBIBELREF | Matt 5,13-16",
						"alts": [],
						"selAlt": 0,
						"bokstav": "I"
					},
					{
						"id": "v2003-25",
						"type": "tekst",
						"heading": "Matt 6,25-34",
						"text": "Det står skrevet i evangeliet etter Matteus:\nJesus sa: Vær ikke bekymret for livet, hva dere skal spise,\neller hva dere skal drikke, heller ikke for kroppen, hva dere skal kle dere med. Er ikke livet mer enn maten og kroppen mer enn klærne?\nSe på fuglene under himmelen! De sår ikke, de høster ikke og samler ikke i hus,\nmen den Far dere har i himmelen, gir dem føde likevel. Er ikke dere mer verdt enn de?\nHvem av dere kan vel med all sin bekymring legge en eneste alen til sin livslengde? Og hvorfor er dere bekymret for klærne? Se på liljene på marken, hvordan de vokser! De strever ikke og spinner ikke, men jeg sier dere: Selv ikke Salomo i all sin prakt var kledd som en av dem. Når Gud kler gresset på marken så fint, det som gror i dag\nog kastes i ovnen i morgen, hvor mye mer skal han ikke da kle dere – dere lite troende!\nSå gjør dere ikke bekymringer, og si ikke: ‘Hva skal vi spise?’ eller: ‘Hva skal vi drikke?’ eller: ‘Hva skal vi kle oss med?’ Alt dette er hedningene opptatt av.\nMen den Far dere har i himmelen, vet jo at dere trenger alt dette.\nSøk først Guds rike og hans rettferdighet, så skal dere få alt det andre i tillegg.\nSå gjør dere ingen bekymringer for morgendagen; morgendagen skal bekymre seg for seg selv.\nHver dag har nok med sin egen plage.\nBIBELREF | Matt 6,25-34",
						"alts": [],
						"selAlt": 0,
						"bokstav": "J"
					},
					{
						"id": "v2003-26",
						"type": "tekst",
						"heading": "Matt 7,7-8.12",
						"text": "Det står skrevet i evangeliet etter Matteus:\nJesus sa: Be, så skal dere få. Let, så skal dere finne.\nBank på, så skal det lukkes opp for dere. For den som ber, han får,\nog den som leter, han finner, og den som banker på, skal det lukkes opp for. Alt dere vil at andre skal gjøre mot dere, det skal også dere gjøre mot dem. For dette er loven og profetene.\nBIBELREF | Matt 7,7-8.12",
						"alts": [],
						"selAlt": 0,
						"bokstav": "K"
					},
					{
						"id": "v2003-27",
						"type": "tekst",
						"heading": "Matt 7,24-25",
						"text": "Det står skrevet i evangeliet etter Matteus:\nJesus sa: Hver den som hører disse mine ord og gjør det de sier, ligner en klok mann som bygde huset sitt på fjell. Regnet styrtet, elvene flommet, og vindene blåste og slo mot huset.\nMen det falt ikke, for det var bygd på fjell.\nBIBELREF | Matt 7,24-25",
						"alts": [],
						"selAlt": 0,
						"bokstav": "L"
					},
					{
						"id": "v2003-28",
						"type": "tekst",
						"heading": "Joh 15,9-12[-17]",
						"text": "Det står skrevet i evangeliet etter Johannes:\nJesus sa: Som Far har elsket meg, har jeg elsket dere. Bli i min kjærlighet!\nHvis dere holder mine bud, blir dere i min kjærlighet, slik jeg har holdt min Fars bud og blir i hans kjærlighet. Dette har jeg sagt dere for at min glede kan være i dere\nog deres glede kan bli fullkommen. Og dette er mitt bud:\nDere skal elske hverandre som jeg har elsket dere.\n[Ingen har større kjærlighet enn den som gir livet for vennene sine.\nDere er mine venner hvis dere gjør det jeg befaler dere. Jeg kaller dere ikke lenger tjenere, for tjeneren vet ikke hva herren hans gjør. Jeg kaller dere venner, for jeg har gjort kjent for dere alt jeg har hørt av min Far. Dere har ikke utvalgt meg, men jeg har utvalgt dere og satt\ndere til å gå ut og bære frukt, en frukt som varer. Da skal Far gi dere alt dere ber om i mitt navn. Dette er mitt bud til dere: Elsk hverandre!]\nBIBELREF | Joh 15,9-12[-17]",
						"alts": [],
						"selAlt": 0,
						"bokstav": "M"
					},
					{
						"id": "v2003-29",
						"type": "tekst",
						"heading": "Rom 8,38-39",
						"text": "Det står skrevet i Paulus’ brev til romerne:\nFor jeg er viss på at verken død eller liv, verken engler eller krefter, verken det som nå er eller det som kommer, eller noen makt,\nverken det som er i det høye eller i det dype, eller noen annen skapning,\nskal kunne skille oss fra Guds kjærlighet i Kristus Jesus, vår Herre.\nBIBELREF | Rom 8,38-39",
						"alts": [],
						"selAlt": 0,
						"bokstav": "N"
					},
					{
						"id": "v2003-30",
						"type": "tekst",
						"heading": "1 Kor 13",
						"text": "Det står skrevet i Paulus’ første brev til korinterne:\n(Kapitlet kan leses i sin helhet eller i utdrag.)\nOm jeg taler med menneskers og englers tunger, men ikke har kjærlighet, da er jeg bare drønnende malm eller en klingende bjelle.\nOm jeg har profetisk gave, kjenner alle hemmeligheter og eier all kunnskap, om jeg har all tro så jeg kan flytte fjell, men ikke har kjærlighet, da er jeg intet.\nOm jeg gir alt jeg eier til brød for de fattige, ja, om jeg gir meg selv til å brennes, men ikke har kjærlighet, da har jeg ingen ting vunnet.\nKjærligheten er tålmodig, kjærligheten er velvillig, den misunner ikke, skryter ikke, er ikke hovmodig. Kjærligheten krenker ikke, søker ikke sitt eget, er ikke oppfarende og gjemmer ikke på det onde. Den gleder seg ikke over urett, men har sin glede i sannheten.\nKjærligheten utholder alt, tror alt, håper alt, tåler alt. Kjærligheten tar aldri slutt. Profetgavene skal bli borte, tungene skal tie og kunnskapen forgå.\nFor vi forstår stykkevis og taler profetisk stykkevis. Men når det fullkomne kommer,\nskal det som er stykkevis, ta slutt. Da jeg var barn, talte jeg som et barn, tenkte jeg som et barn, forsto jeg som et barn. Men da jeg ble voksen, la jeg av det barnslige.\nNå ser vi i et speil, i en gåte, da skal vi se ansikt til ansikt. Nå forstår jeg stykkevis, da skal jeg erkjenne fullt ut, slik Gud kjenner meg fullt ut. Så blir de stående, disse tre: tro, håp og kjærlighet. Men størst blant dem er kjærligheten.\nBIBELREF | 1 Kor 13",
						"alts": [],
						"selAlt": 0,
						"bokstav": "O"
					},
					{
						"id": "v2003-31",
						"type": "tekst",
						"heading": "Ef 3,14-21",
						"text": "Det står skrevet i Paulus’ brev til efeserne:\nDerfor bøyer jeg mine knær for Far, han som har gitt navn til alt som kalles far i himmel og på jord. Må han som er så rik på herlighet, gi deres indre menneske kraft og styrke ved sin Ånd. Må Kristus ved troen bo i deres hjerter\nog dere stå rotfestet og grunnfestet i kjærlighet. Må dere sammen med alle de hellige\nbli i stand til å fatte bredden og lengden, høyden og dybden, ja, kjenne Kristi kjærlighet, som overgår all kunnskap. Må dere bli fylt av hele Guds fylde!\nHan som virker i oss med sin kraft og kan gjøre uendelig mye mer enn det vi ber om og\nforstår, ham være ære i kirken og i Kristus Jesus gjennom alle slekter og evigheter! Amen.\nBIBELREF | Ef 3,14-21",
						"alts": [],
						"selAlt": 0,
						"bokstav": "P"
					},
					{
						"id": "v2003-32",
						"type": "tekst",
						"heading": "Fil 2,1-5",
						"text": "Det står skrevet i Paulus’ brev til filipperne:\nOm det da er trøst i Kristus, oppmuntring i kjærligheten, fellesskap i Ånden, om det finnes medfølelse og barmhjertighet, så gjør nå min glede fullkommen: Ha samme sinnelag og samme kjærlighet, vær ett i sjel og sinn.\nGjør ikke noe av selvhevdelse og tom ærgjerrighet, men vær ydmyke og sett de andre høyere enn dere selv. Tenk ikke bare på deres eget beste, men også på de andres.\nLa samme sinnelag være i dere som også var i Kristus Jesus!\nBIBELREF | Fil 2,1-5",
						"alts": [],
						"selAlt": 0,
						"bokstav": "Q"
					},
					{
						"id": "v2003-33",
						"type": "tekst",
						"heading": "Fil 4,4-8",
						"text": "Det står skrevet i Paulus’ brev til filipperne:\nGled dere alltid i Herren! Igjen vil jeg si: Gled dere!\nLa alle mennesker få merke at dere er vennlige. Herren er nær.\nVær ikke bekymret for noe! Men legg alt dere har på hjertet, fram for Gud. Be og kall på ham med takk. Og Guds fred, som overgår all forstand,\nskal bevare deres hjerter og tanker i Kristus Jesus. Til slutt, søsken: Alt som er sant og edelt, rett og rent, alt som er verdt å elske og akte, alt som er til glede og alt som fortjener ros, legg vinn på det!\nBIBELREF | Fil 4,4-8",
						"alts": [],
						"selAlt": 0,
						"bokstav": "R"
					},
					{
						"id": "v2003-34",
						"type": "tekst",
						"heading": "Kol 3, 12b-14",
						"text": "Det står skrevet i Paulus’ brev til kolosserne:\nKle dere derfor i inderlig medfølelse og vær gode, milde, ydmyke og tålmodige,\nså dere bærer over med hverandre og tilgir hverandre hvis den ene har noe å bebreide den andre. Som Herren har tilgitt dere, skal dere tilgi hverandre.\nOg over alt dette: Kle dere i kjærlighet, som er båndet som binder sammen\nog gjør fullkommen.\nBIBELREF | Kol 3, 12b-14",
						"alts": [],
						"selAlt": 0,
						"bokstav": "S"
					},
					{
						"id": "v2003-35",
						"type": "tekst",
						"heading": "1 Joh 4,7-12",
						"text": "Det står skrevet i Johannes’ første brev:\nMine kjære, la oss elske hverandre! For kjærligheten er fra Gud,\nog hver den som elsker, er født av Gud og kjenner Gud.\nDen som ikke elsker, har aldri kjent Gud, for Gud er kjærlighet.\nOg ved dette ble Guds kjærlighet åpenbart blant oss, at Gud sendte sin enbårne Sønn til verden\nfor at vi skulle leve ved ham.\nJa, dette er kjærligheten, ikke at vi har elsket Gud, men at han har elsket oss\nog sendt sin Sønn til soning for våre synder.\nMine kjære, har Gud elsket oss slik, da skylder også vi å elske hverandre. Ingen har noen gang sett Gud. Men dersom vi elsker hverandre, blir Gud i oss, og hans kjærlighet er fullendt i oss.\nBIBELREF | 1 Joh 4,7-12",
						"alts": [],
						"selAlt": 0,
						"bokstav": "T"
					}
				]
			},
			{
				"title": "5 Salme",
				"items": [
					{
						"id": "v2003-6",
						"type": "salme",
						"heading": "5 Salme",
						"instr": "Salmen kan erstattes av egnet vokal- eller instrumentalmusikk.",
						"text": ""
					}
				]
			},
			{
				"title": "6 Tale",
				"items": [
					{
						"id": "v2003-7",
						"type": "instruks",
						"heading": "6 Tale",
						"instr": "Liturgen holder en tale over et av de skriftordene som er lest under ledd 4 eller over en annen høvelig tekst.",
						"text": "",
						"alts": [],
						"selAlt": 0
					}
				]
			},
			{
				"title": "7 Ekteskapsinngåelse",
				"items": [
					{
						"id": "v2003-8",
						"type": "tekst",
						"heading": "7 Ekteskapsinngåelse",
						"instr": "Her kan følge",
						"alts": [
							{
								"label": "Kort",
								"text": "{{r}}L |{{/r}} For Gud vår Skapers ansikt og i disse vitners nærvær spør jeg deg, (brudgommens fulle navn uten tittel): Vil du ha (brudens fulle navn uten tittel), som står ved din side, til din ektefelle?\n@NOTAT Brudgommen sier:\nJa.\n{{r}}L |{{/r}} Vil du elske og ære henne og bli trofast hos henne i gode og onde dager inntil døden skiller dere?\n@NOTAT Brudgommen sier:\nJa.\n{{r}}L |{{/r}} Likeså spør jeg deg, (brudens fulle navn uten tittel): Vil du ha (brudgommens fulle navn uten tittel), som står ved din side, til din ektefelle?\n@NOTAT Bruden sier:\nJa.\n{{r}}L |{{/r}} Vil du elske og ære ham og bli trofast hos ham i gode og onde dager inntil døden skiller dere?\n@NOTAT Bruden sier:\nJa.\n{{r}}L |{{/r}} Så gi hverandre hånden på det.\n@NOTAT Brudeparet vender seg mot hverandre og gir hverandre høyre hånd. Liturgen legger sin hånd på brudeparets hender.\n{{r}}L |{{/r}} For Guds ansikt og i disse vitners nærvær\nhar dere nå lovet hverandre at dere vil leve sammen i ekteskap, og gitt hverandre hånden på det.\nDerfor erklærer jeg at dere er rette ektefolk."
							},
							{
								"label": "Lang",
								"text": "{{r}}L |{{/r}} For Gud vår Skapers ansikt og i disse vitners nærvær spør jeg deg, (brudgommens fulle navn uten tittel): Vil du ha (brudens fulle navn uten tittel), som står ved din side, til din ektefelle?\n@NOTAT Brudgommen sier:\nJa.\n{{r}}L |{{/r}} Likeså spør jeg deg, (brudens fulle navn uten tittel): Vil du ha\n(brudgommens fulle navn uten tittel), som står ved din side, til din ektefelle?\n@NOTAT Bruden sier:\nJa.\n\n{{r}}L |{{/r}} Gjenta nå etter meg.\n@NOTAT Brudgom og brud vender seg til hverandre. De gir hverandre hendene og blir stående slik mens de avgir løftet. Liturgen leser løftet ledd for ledd, deretter fremsier brudeparet det, den ene først.\n{{r}}L |{{/r}} Jeg tar deg (navnet nevnes) til min ektefelle.\n{{r}}B |{{/r}} Jeg tar deg (navnet nevnes) til min ektefelle.\n{{r}}L |{{/r}} Jeg vil elske og ære deg\n{{r}}B |{{/r}} Jeg vil elske og ære deg\n{{r}}L |{{/r}} og bli trofast hos deg i gode og onde dager\n{{r}}B |{{/r}} og bli trofast hos deg i gode og onde dager\n{{r}}L |{{/r}} inntil døden skiller oss.\n{{r}}B |{{/r}} inntil døden skiller oss.\n@NOTAT (Deretter gjentas løfteavleggelsen på samme måte av den andre ektefellen. Liturgen legger sin hånd på brudeparets hender.)\n{{r}}\n{{/r}}\n{{r}}L |{{/r}} For Guds ansikt og i disse vitners nærvær har dere nå lovet hverandre at dere vil leve sammen i ekteskap, og gitt hverandre hånden på det.\nDerfor erklærer jeg at dere er rette ektefolk."
							}
						],
						"selAlt": 0,
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}L |{{/r}} Kom nå fram til Herrens alter, så vi kan høre deres løfter til hverandre og be om Guds velsignelse over dere og over hjemmet deres.\n@NOTAT Brudeparet går fram til alterringen. Deretter følger:"
							}
						],
						"selIntro": 0,
						"text": ""
					}
				]
			},
			{
				"title": "8 Overrekkelse av ringer",
				"items": [
					{
						"id": "v2003-9",
						"type": "tekst",
						"heading": "8 Overrekkelse av ringer",
						"alts": [
							{
								"label": "Kort",
								"text": "{{r}}L |{{/r}} Gi nå hverandre ringene, som dere skal bære til tegn på løftet om troskap.\n@NOTAT Hver av dem setter ringen på fingeren til den andre."
							},
							{
								"label": "B",
								"text": "{{r}}L |{{/r}} Gi nå hverandre ringene, som dere skal bære til tegn på løftet dere har gitt hverandre. Gjenta etter meg.\n@NOTAT \n\n@NOTAT Liturgen leser ordene ledd for ledd (L), deretter fremsier brudeparet dem (B), den ene først.\n{{r}}L |{{/r}} (Navnet), jeg gir deg denne ring\n{{r}}B |{{/r}} (Navnet), jeg gir deg denne ring\n{{r}}L |{{/r}} som et tegn på mitt løfte om kjærlighet og troskap.\n{{r}}B |{{/r}} som et tegn på mitt løfte om kjærlighet og troskap.\n@NOTAT Ringen settes så på fingeren til den andre.\n@NOTAT Deretter gjentas overrekkelsen på samme måte av den andre ektefellen."
							}
						],
						"selAlt": 0,
						"text": ""
					}
				]
			},
			{
				"title": "9 Forbønn",
				"items": [
					{
						"id": "v2003-10",
						"type": "tekst",
						"heading": "9 Forbønn",
						"instr": "Ekteparet kneler ved alterringen.\nLiturgen ber for brudeparet med håndspåleggelse en av følgende bønner, som avsluttes med Herrens bønn. Eventuelt kan også andre i følget delta i forbønnen med håndspåleggelse.\nHer kan det tilføyes en fritt utformet bønn, eventuelt kombinert med lystenning. Eventuelt kan menigheten synge en bønnesalme (mens brudeparet kneler).\nSe for eksempel Norsk salmebok 2013 nr 431, 624, 638, 652, 653, 678, 680. Forbønnen avsluttes alltid med Fadervår.\nDet er også anledning til å benytte Fadervår etter 1920- eller 1977- liturgien. Ekteparet setter seg på plassene sine.\nHer kan følge",
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}L |{{/r}} La oss alle be."
							}
						],
						"selIntro": 0,
						"alts": [
							{
								"label": "A",
								"text": "{{r}}L |{{/r}} Barmhjertige Gud, du som har innsatt ekteskapet og velsignet kvinne og mann, vi ber deg: La din velsignelse hvile over (navnet nevnes) og (navnet nevnes) som her kneler for ditt ansikt.\nFyll dem med din kjærlighet, og bygg deres hjem i fred.\nSe til dem i nåde, og styrk dem med din Ånd, så de i gode og onde dager setter sin lit til deg, holder trofast sammen og hjelper hverandre fram mot det evige liv."
							},
							{
								"label": "B",
								"text": "{{r}}L |{{/r}} Gode Gud, vi takker deg for (navnet nevnes) og (navnet nevnes) og for deres kjærlighet til hverandre. Velsign deres liv som ektefolk.\nHjelp dem å holde de løfter de har gitt hverandre, så deres ekteskap kan fylles av tillit, omsorg og glede.\nGi dem evne og vilje til å bygge sitt hjem i fred, så det blir et sted der [barn kan vokse opp i trygghet og] familie og venner kan finne fellesskap.\nDu som er veien, sannheten og livet, la dem få vandre i din sannhet. Du som tilgir og leger, hjelp dem å tilgi hverandre. Du som er kjærlighetens kilde, gi dem og alle ektefolk å vokse og modnes i kjærlighet."
							}
						],
						"selAlt": 0,
						"avslutningAlts": [
							{
								"label": "Fadervår",
								"text": "{{r}}L |{{/r}} La oss sammen be Fadervår.\n{{r}}A |{{/r}} Vår Far i himmelen! La navnet ditt helliges. La riket ditt komme.\nLa viljen din skje på jorden slik som i himmelen. Gi oss i dag vårt daglige brød,\nog tilgi oss vår skyld,\nslik også vi tilgir våre skyldnere. Og la oss ikke komme i fristelse, men frels oss fra det onde.\nFor riket er ditt,\nog makten og æren i evighet. Amen."
							}
						],
						"selAvsl": 0,
						"text": ""
					}
				]
			},
			{
				"title": "10 Musikk/symbolhandlinger",
				"items": [
					{
						"id": "v2003-11",
						"type": "instruks",
						"heading": "10 Musikk/symbolhandlinger",
						"instr": "Deltakere i bryllupsfølget og andre kan medvirke med musikk, høytlesning eller andre kulturelle innslag.",
						"alts": [],
						"selAlt": 0,
						"text": ""
					}
				]
			},
			{
				"title": "11 Salme",
				"items": [
					{
						"id": "v2003-12",
						"type": "salme",
						"heading": "11 Salme",
						"text": ""
					}
				]
			},
			{
				"title": "12 Velsignelse",
				"items": [
					{
						"id": "v2003-13",
						"type": "tekst",
						"heading": "12 Velsignelse",
						"instr": "Under den følgende stille bønn kan en klemte tre ganger tre bønneslag med en av kirkens klokker.\nHer kan det også fremføres egnet vokal- eller instrumentalmusikk.",
						"alts": [
							{
								"label": "A",
								"text": "@NOTAT L vendt mot menigheten.\n{{r}}L | {{/r}}La oss prise Herren.\n@NOTAT Menigheten reiser seg (M).\n{{r}}M |{{/r}} Gud være lovet. Halleluja. Halleluja. Halleluja.\n{{r}}L |{{/r}} Herren velsigne deg og bevare deg.\nHerren la sitt ansikt lyse over deg og være deg nådig. Herren løfte sitt åsyn på deg og gi deg fred. ✝\n{{r}}M |{{/r}} Amen. Amen. Amen."
							},
							{
								"label": "B",
								"text": "@NOTAT L vendt mot menigheten.\n{{r}}L | {{/r}}Ta imot velsignelsen.\n@NOTAT Menigheten reiser seg.\n{{r}}L |{{/r}} Herren velsigne deg og bevare deg.\nHerren la sitt ansikt lyse over deg og være deg nådig. Herren løfte sitt åsyn på deg og gi deg fred. ✝\n{{r}}M |{{/r}} Amen."
							}
						],
						"selAlt": 1,
						"text": ""
					}
				]
			},
			{
				"title": "13 Utgang",
				"items": [
					{
						"id": "v2003-14",
						"type": "instruks",
						"heading": "13 Utgang",
						"instr": "Orgelmusikk eller annen egnet musikk. Ekteparet går sammen ut av kirken.",
						"text": "",
						"alts": [],
						"selAlt": 0
					}
				]
			}
		],
		"erOriginal": true,
		"visInstr": true,
		"visRoles": true,
		"visSalmeinfo": true,
		"malForm": "bokmål"
	},
	{
	"id": "konfirmasjon-2021",
		kategori: "Dåp og konfirmasjon",
		oversettelser: ["konfirmasjonstidens-gudstjenester-2021-nynorsk"],
	bibeltekster: [{ "lesning": "L1", "leddId": "konf21-12" }, { "lesning": "L2", "leddId": "konf21-14" }, { "lesning": "E", "leddId": "konf21-15" }],
	"name": "Konfirmasjonstidens gudstjenester (2021)",
	"description": "Ordning for konfirmasjonstidens gudstjenester — vedtatt av Kirkemøtet 2021. Med bønn for konfirmantene og presentasjonsgudstjeneste.",
	"sections": [
		{
			"title": "Innledning",
			"items": [
				{
					"id": "konf21-1",
					"type": "instruks",
					"heading": "Bestemmelser",
					"instr": "Ordning for konfirmasjonstidens gudstjenester\nVedtatt av Kirkemøtet 2021\n\nGudstjeneste med presentasjon av menighetens konfirmanter\nVed starten av konfirmasjonstiden presenteres menighetens konfirmanter i en gudstjeneste.\nPresentasjonen av konfirmantene kan skje i gudstjenestens samlingsdel eller i forbindelse med forbønnsdelen. Til presentasjonen kan man knytte lystenning eller andre enkle symbolhandlinger.\nForbønn kan hentes fra Formulerte forbønner i Ordning for hovedgudstjeneste alternativ 4 eller formuleres lokalt.\n\nKONFIRMASJONSGUDSTJENESTE\nKonfirmasjonstiden avsluttes med konfirmasjonsgudstjenesten. Gudstjenesten kan feires med nattverd.\nKonfirmasjon feires som hovedregel i menighetens hovedgudstjeneste på søn- eller helligdag. Konfirmasjonsgudstjenesten kan også legges til en lørdag.\nGudstjenesten følger den lokale grunnordning for hovedgudstjeneste.\nVed prosesjon kan det ringes med alle klokkene.\nPrest kan bære messehagel. Liturgisk farge er hvit.\nDer det er påskelys er dette tent.\nEt stjernetegn (*) er satt til ledd der menigheten som hovedregel står.",
					"text": "",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-2",
					"type": "tekst",
					"heading": "Bønn for konfirmantene",
					"instr": "Følgende bønn kan brukes som Bønn for konfirmantene, på forbønnens plass.",
					"text": "{{r}}L/ML |{{/r}} La oss vende oss til Gud i bønn.\nKjære Gud, du kjenner og elsker oss alle.\nTakk for livet du har gitt oss.\nVi takker deg for konfirmantene.\nVi ber for hver og én av dem,\nfor familie, venner og faddere.\nVelsign konfirmasjonstiden\nog la oss alle vokse i tro, håp og kjærlighet.\nGud, vi ber:\n{{r}}M |{{/r}} Menighetssvar\n{{r}}L/ML |{{/r}} Gode Gud, du har skapt oss og jorden vi bor på.\nLær oss å ta vare på ditt skaperverk,\nskape fred der hatet rår, gi sultne mat\nog verne mennesker på flukt.\nVi ber for vårt land og for stedet vi bor (eller byen/bygda).\nStyrk våre fellesskap og gi alle et sted å høre til.\nGud, vi ber:\n{{r}}M |{{/r}} Menighetssvar\n{{r}}L/ML |{{/r}} Takk for kirken,\nder du møter oss med dine gaver\nog gir oss fremtid og håp.\nLa kirken være stedet hvor troen og livet finner styrke og kraft.\nGud, vi ber:\n{{r}}M |{{/r}} Menighetssvar\n{{r}}L/ML |{{/r}} Evt.: Vi ber for… (aktuelle bønneemner i lokalt- nasjonalt eller globalt perspektiv)\n{{r}}L/ML |{{/r}} Gud vi ber:\n{{r}}M |{{/r}} Menighetssvar\n(Her følger Fadervår. Dersom det feires nattverd, bes Fadervår under nattverdsdelen.)\n(Gudstjenesten fortsetter i tråd med lokal grunnordning.)",
					"alts": [],
					"selAlt": 0
				}
			]
		},
		{
			"title": "I. Samling",
			"items": [
				{
					"id": "konf21-3",
					"type": "tekst",
					"heading": "1 Forberedelse",
					"instr": "Klokkeringing\nHer eller etter ledd 3 Hilsen kan det være:\nKort informasjon om dagens gudstjeneste ved medliturg eller liturg.\nInformasjonen avsluttes med:\nKort stillhet\nTre klokkeslag",
					"text": "{{r}}ML/L |{{/r}} La oss være stille for Gud.",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-4",
					"type": "tekst",
					"heading": "2 Inngangssalme",
					"optional": true,
					"instr": "Menigheten står under prosesjon, Inngangssalme og Hilsen.",
					"text": "",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-5",
					"type": "tekst",
					"heading": "3 Hilsen",
					"optional": true,
					"instr": "Før de to første alternativene til inngangsord kan liturgen si: Kjære menighet.\nOm kort informasjon om dagens gudstjeneste ikke er gitt under ledd 1, kan den gis her.",
					"alts": [
						{
							"label": "Hovedvariant",
							"text": "{{r}}L |{{/r}} Nåde være med dere og fred\nfra Gud, vår Far, og Herren Jesus Kristus."
						},
						{
							"label": "Eller",
							"text": "{{r}}L |{{/r}} Vår Herre Jesu Kristi nåde, Guds kjærlighet\nog Den hellige ånds samfunn være med dere alle."
						},
						{
							"label": "Eller 2",
							"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den hellige ånds navn."
						},
						{
							"label": "Eller 3",
							"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den hellige ånds navn:\nVår skaper, frigjører og livgiver."
						}
					],
					"selAlt": 0,
					"text": ""
				},
				{
					"id": "konf21-6",
					"type": "tekst",
					"heading": "4 Samlingsbønn",
					"instr": "Se samlingsbønner i Ordning for hovedgudstjeneste eller samlingsbønner med eget ledd for konfirmasjon (pkt 9, Samlingsbønner med kirkeårsvariable ledd). Samlingsbønn kan også utformes lokalt (pkt 10, Modell for lokalt utformet samlingsbønn). En kan også bruke følgende (fra 2002-liturgien):",
					"introAlts": [
						{
							"label": "Innledning",
							"text": "{{r}}L |{{/r}} Herre, vår Gud, takk for konfirmasjonstiden.\nTakk for at du elsker oss og kjenner alt i våre liv.\nGjør oss åpne for det du vil gi oss.\nVelsign denne dagen. Amen."
						},
						{
							"label": "Innledning",
							"text": "{{r}}L |{{/r}} La oss be."
						}
					],
					"selIntro": 0,
					"alts": [],
					"selAlt": 0,
					"text": ""
				},
				{
					"id": "konf21-7",
					"type": "tekst",
					"heading": "5 Syndsbekjennelse",
					"instr": "Følger her, eller før ledd 15 Påminnelse om dåpen.",
					"text": "",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-8",
					"type": "tekst",
					"heading": "6 Bønnerop Kyrie",
					"text": "",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-9",
					"type": "tekst",
					"heading": "7 Lovsang Gloria",
					"text": "",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-10",
					"type": "tekst",
					"heading": "8 Dagens bønn",
					"instr": "Dagens bønn kan utelates.\nIstedenfor Dagens bønn for den aktuelle søndag kan man bruke følgende bønn:",
					"text": "{{r}}L |{{/r}} Evige Gud, vi takker og lovpriser deg.\nDet er i deg vi lever, rører oss og er til.\nVær vår styrke og hjelp gjennom livet,\nved din Sønn Jesus Kristus, vår Herre,\nsom med deg og Den hellige ånd lever og råder,\nén sann Gud fra evighet til evighet.",
					"alts": [],
					"selAlt": 0
				}
			]
		},
		{
			"title": "II. Ordet",
			"items": [
				{
					"id": "konf21-11",
					"type": "instruks",
					"heading": "Om lesningene",
					"instr": "Det leses én eller to lesetekster i tillegg til prekenteksten.\nDet benyttes i hovedsak tekster fra tekstutvalget for konfirmasjonsgudstjeneste.\nKirkeårets tekster kan også velges, og det kan velges andre høvelige tekster som har vært sentrale i konfirmasjonstiden.\n\nTekster til konfirmasjonsgudstjeneste:\nGT: \tSalme 71, 1-6\nEpistel. 1. Joh 4, 7-12\nEvangelium: Lukas 2,41-52\nGT: \tSalme 23\nEpistel: Gal. 5, 13-14\nEvangelium: Luk 24, 13-16. 28-35\nGT: \tSalme 8\nEpistel: 1. Kor. 13, 7-13\nEvangelium: Joh 11, 17-29\nGT:\t Jer. 29, 11-14a\nEpistel: Ef. 3, 14-21\nEvangelium: Matt. 6, 25-31. 33\nGT: \tSalme 25, 4-5\nEpistel: 1. Kor. 12, 12 - 22\nEvangelium: Joh. 14, 1-7\nGT: \tSalme 139, 1-6\nEpistel: Ef. 2, 8-10\nEvangelium: Luk 15, 1 – 10, eller Luk 15,11-24",
					"text": "",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-12",
					"type": "tekst",
					"heading": "9 Første lesning",
					"instr": "Fra Det gamle testamentet",
					"introAlts": [
						{
							"label": "Innledning",
							"text": "{{r}}ML |{{/r}} Det står skrevet i/hos …\n(Lesningen avsluttes med:)\n{{r}}ML |{{/r}} Slik lyder Herrens ord."
						},
						{
							"label": "Innledning",
							"text": "{{r}}L/ML |{{/r}} La oss høre Herrens ord."
						}
					],
					"selIntro": 0,
					"alts": [],
					"selAlt": 0,
					"text": ""
				},
				{
					"id": "konf21-13",
					"type": "tekst",
					"heading": "10 Bibelsk salme / Salme",
					"instr": "Det kan synges en bibelsk salme eller en annen salme, være korsang eller kort stillhet mellom lesningene.",
					"text": "",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-14",
					"type": "tekst",
					"heading": "11 Andre lesning",
					"instr": "Fra Det nye testamentet utenom evangeliene",
					"text": "{{r}}ML |{{/r}} Det står skrevet i …\n(Lesningen avsluttes med:)\n{{r}}ML |{{/r}} Slik lyder Herrens ord.",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-15",
					"type": "tekst",
					"heading": "12 Evangelium",
					"optional": true,
					"instr": "Halleluja\nEvangelielesningen innledes med hallelujaomkved eller et salmevers med hallelujaomkved.\nMenigheten står under halleluja, lesning og respons.\nDet kan være evangelieprosesjon. Den som bærer boken kan ledsages av lysbærere.\nSe hallelujaomkved i N13: 977.1 – 7.  Også Lovprisning/Benedicamus i ledd 25 kan benyttes som hallelujaomkved. Omtale av halleluja og tractus i finnes i Gudstjenesteboken under ledd 12 Evangelium.\n\nRespons\nHallelujaomkved gjentas, eller det synges en kort salme eller et annet svarledd ved menighet eller kor.",
					"text": "{{r}}L/ML |{{/r}} Det står skrevet i evangeliet etter …\n(Lesningen avsluttes med:)\n{{r}}L/ML |{{/r}} Slik lyder det hellige evangelium.",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-16",
					"type": "tekst",
					"heading": "13 Preken",
					"instr": "Predikanten preker over evangelieteksten eller annen høvelig prekentekst.\nPrekenen kan avsluttes med en av disse lovprisningene:\nEtter prekenen kan det gis tid til stillhet, en kort salme eller meditativ musikk.",
					"alts": [
						{
							"label": "A",
							"text": "{{r}}L |{{/r}} Ære være Faderen og Sønnen og Den hellige ånd,\nsom var og er og blir én sann Gud fra evighet og til evighet."
						},
						{
							"label": "B",
							"text": "{{r}}L |{{/r}} Ære være Faderen og Sønnen og Den hellige ånd: Vår skaper, frigjører og livgiver."
						}
					],
					"selAlt": 0,
					"text": ""
				},
				{
					"id": "konf21-17",
					"type": "tekst",
					"heading": "14 Salme",
					"instr": "Syndsbekjennelse følger her, eller som ledd 5.\nDersom det ikke er dåp, følger 15 Påminnelse om dåpen.",
					"text": "",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-18",
					"type": "tekst",
					"heading": "15 Påminnelse om dåpen",
					"instr": "Påminnelse om dåpen utføres som hovedregel ved døpefonten.\nLiturgen eller en medliturg heller vann i døpefonten.\nAndre symbolhandlinger i tråd med lokale tradisjoner kan benyttes.",
					"alts": [
						{
							"label": "Hovedvariant",
							"text": "(vendt mot menigheten)\n{{r}}L |{{/r}} Kjære menighet:\nI dåpen frelste Gud oss ut av mørkets makt og gav oss rett til å være lysets barn.\nVi ble kalt til å følge Kristus og leve i fellesskap med ham.\nLa oss derfor bekjenne forsakelsen og troen som lød ved vår dåp.\n(Menigheten reiser seg.)"
						},
						{
							"label": "Eller",
							"text": "{{r}}L |{{/r}} I dåpen ble vi forenet med den korsfestede og oppstandne Jesus Kristus.\nLa oss sammen bekjenne forsakelsen og troen som lød ved vår dåp.\n(Menigheten reiser seg.)"
						},
						{
							"label": "Eller 2",
							"text": "{{r}}L |{{/r}} I dåpen ble vi født på ny av vann og ånd.\nVi ble døpt til et liv i tro og tillit til Jesus Kristus.\nLa oss sammen bekjenne forsakelsen og troen som lyder ved dåpen.\n(Menigheten reiser seg.)"
						},
						{
							"label": "Eller 3",
							"text": "{{r}}L |{{/r}} I dåpen ble vi tegnet med det hellige korsets tegn og født på ny av vann og ånd.\nVi ble forenet med den korsfestede og oppstandne Jesus Kristus og tatt inn i kirkens fellesskap.\nLa oss sammen bekjenne forsakelsen og troen som lyder ved dåpen.\n(Menigheten reiser seg.)"
						}
					],
					"selAlt": 0,
					"text": ""
				},
				{
					"id": "konf21-19",
					"type": "tekst",
					"heading": "16 Forsakelsen og troen",
					"text": "{{r}}A |{{/r}} Jeg forsaker djevelen….\n(Den apostoliske trosbekjennelse)\n(Menigheten setter seg.)",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-20",
					"type": "tekst",
					"heading": "17 Salme",
					"instr": "I stedet for salmen kan det være vokal-eller instrumentalmusikk.",
					"text": "",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-21",
					"type": "tekst",
					"heading": "18 Forbønn for kirken og verden",
					"instr": "Her kan det nevnes aktuelle forbønner for konfirmantenes familier og relasjoner, forbønner som angår årets konfirmanter spesielt samt hendelser som berører lokalsamfunnet.\nMenighetssvaret følger lokal grunnordning.",
					"alts": [
						{
							"label": "A Forbønn for konfirmantene",
							"text": "{{r}}L |{{/r}} Kjære menighet\nLa oss takke og be for våre konfirmanter.\n(Alternativ til lokalt utformede bønner:)\n{{r}}L/ML |{{/r}} Kjære Gud, takk for konfirmantene.\nDu har i dåpen lovet å være med oss alle dager.\nVi ber for familier, slekt og venner\nog for alle som står konfirmantene nær.\nGud, vi ber:\n{{r}}M |{{/r}} Menighetssvar\n{{r}}L/ML |{{/r}} Trofaste Gud, du møter oss i ditt Ord, i bønnen og nattverden.\nStyrk oss alle i tro, håp og kjærlighet,\nog gi oss å nå det evige mål i ditt rike.\nGud, vi ber:\n{{r}}M |{{/r}} Menighetssvar\n{{r}}L/ML |{{/r}} Evt.: Vi ber for… (aktuelle bønneemner i lokalt, nasjonalt eller globalt perspektiv)\n{{r}}L/ML |{{/r}} Gud vi ber\n{{r}}M |{{/r}} Menighetssvar\n(Her følger Fadervår. Dersom det feires nattverd, bes Fadervår under Del III, Nattverd.)"
						},
						{
							"label": "B Bønnesalme",
							"text": "(Bønnesalme.)"
						}
					],
					"selAlt": 0,
					"text": ""
				},
				{
					"id": "konf21-22",
					"type": "tekst",
					"heading": "18 C Forbønn med velsignelse av den enkelte konfirmant",
					"instr": "(Liturg/medliturg, vendt mot menigheten:)\nKonfirmantene går fram slik det er avtalt på forhånd og kneler på alterringen.\nAlternativt kan én og én konfirmant gå fram til døpefonten og bli tegnet i hånden med et korstegn av en medliturg. Det kan også tennes et lys for konfirmanten. Så går konfirmanten fram til forbønn ved alteret. Når én konfirmant går fra alterringen går den neste fram.\nLiturgen/medliturgen ber for hver enkelt med håndspåleggelse.\nBønnene avsluttes med «Velsign og bevar henne/ham, i Jesu Kristi navn».\nUnder disse ordene tegnes det et korstegn over konfirmanten.\nEtter forbønnen eller ved del IV Sendelse, kan den enkelte motta et kors, en rose eller en annen symbolsk gave i henhold til lokal tradisjon.\nEtter at alle konfirmantene er bedt for sier liturgen:",
					"alts": [
						{
							"label": "1",
							"text": "{{r}}L/ML |{{/r}} Livets Gud, vi ber for NN. Hjelp henne/ham til å leve i tillit og tro på din kjærlighet. Velsign og bevar henne/ham, () i Jesu Kristi navn."
						},
						{
							"label": "2",
							"text": "{{r}}L/ML |{{/r}} Trofaste Gud, vi ber for NN. Hold henne/ham fast i en sann tro ved din hellige Ånd. Velsign og bevar henne/ham, () i Jesu Kristi navn."
						},
						{
							"label": "3",
							"text": "{{r}}L/ML |{{/r}} Gode Gud, vi ber for NN. Vær hennes/hans støtte og tilflukt gjennom livet. Velsign og bevar henne/ham, () i Jesu Kristi navn."
						},
						{
							"label": "4",
							"text": "{{r}}L/ML |{{/r}} Kjærlighetens Gud, vi ber for NN. Styrk henne/ham til et liv i tro, håp og kjærlighet. Velsign og bevar henne/ham, () i Jesu Kristi navn."
						},
						{
							"label": "5",
							"text": "{{r}}L/ML |{{/r}} Gud, vår skaper, vi ber for NN. Gi henne/ham styrke og kraft ved din hellige Ånd og vis henne/ham dine veier. Velsign og bevar henne/ham, () i Jesu Kristi navn."
						},
						{
							"label": "6",
							"text": "{{r}}L/ML |{{/r}} Evige Gud, vi ber for NN. La henne/ham vandre i ditt lys og leve omsluttet av din kjærlighet. Velsign og bevar henne/ham, () i Jesu Kristi navn."
						},
						{
							"label": "7",
							"text": "{{r}}L/ML |{{/r}} Barmhjertige Gud, vi ber for NN. Styrk henne/ham ved Den hellige ånd og vær med henne/ham i alle livets dager. Velsign og bevar henne/ham, () i Jesu Kristi navn."
						},
						{
							"label": "8",
							"text": "{{r}}L/ML |{{/r}} Håpets Gud, vi ber for NN. Vis henne/ham det håpet hun/han har i deg. Velsign og bevar henne/ham, () i Jesu Kristi navn."
						},
						{
							"label": "9",
							"text": "{{r}}L/ML |{{/r}} Livets Gud, vi ber for NN. La henne/ham leve i ditt lys og nå det evige mål hos deg. Velsign og bevar henne/ham, () i Jesu Kristi navn."
						},
						{
							"label": "10",
							"text": "{{r}}L/ML |{{/r}} Nådige Gud, vi ber for NN. Vær hennes/hans styrke og hjelp, nå og alle dager. Velsign og bevar henne/ham () i Jesu Kristi navn."
						},
						{
							"label": "11",
							"text": "{{r}}L/ML |{{/r}} Trofaste Gud, vi ber for NN. Vær nær henne/ham med din nåde og kraft. Velsign og bevar henne/ham, () i Jesu Kristi navn."
						}
					],
					"selAlt": 0,
					"avslutningAlts": [
						{
							"label": "Etter alle konfirmantene",
							"text": "{{r}}L |{{/r}} Velsignet er Gud, vår Herre Jesu Kristi Far, han som i sin rike miskunn har født oss på ny til et levende håp ved Jesu Kristi oppstandelse fra de døde! Fred være med dere."
						},
						{
							"label": "Eller",
							"text": "{{r}}L |{{/r}} Gud er kjærlighet, og den som blir i kjærligheten, blir i Gud og Gud i ham. Må han som begynte den gode gjerning i dere, fullføre den, helt til Jesu Kristi dag. Fred være med dere."
						}
					],
					"selAvsl": 0,
					"introAlts": [
						{
							"label": "Innledning",
							"text": "{{r}}L/ML |{{/r}} Kjære konfirmanter.\nTil den kristne tro er dere døpt. I den kristne tro er dere opplært. Kom nå fram til Herrens alter, så vi kan be for og velsigne hver enkelt av dere i Jesu Kristi navn."
						}
					],
					"selIntro": 0,
					"text": ""
				},
				{
					"id": "konf21-23",
					"type": "tekst",
					"heading": "19 Hilsen fra menigheten, kunngjøringer og takkoffer",
					"instr": "Her kan følge egnet instrumental- eller vokalmusikk og eventuelt en kort hilsen fra menigheten.\nHilsenen kan gis av kateket, menighetspedagog eller andre som har hatt spesielt ansvar for konfirmantene. (Se alminnelige bestemmelser pkt 7)\nHilsen kan utformes lokalt eller velges fra følgende alternativer:\nMenighetens takkoffer kan samles inn under forberedelse av nattverdmåltidet eller under postludiet.\nInnsamlingen kan skje i kirkebenkene eller ved at man går rundt alteret.",
					"alts": [
						{
							"label": "A",
							"text": "{{r}}L |{{/r}} Kjære menighet:\nSammen har vi bedt for konfirmantene. La oss sammen hjelpe dem så de kan leve i den kristne forsakelse og tro, og modnes til tjeneste for Gud og vår neste. La oss oppmuntre hverandre til å bruke Guds ord og Herrens nattverd og gå den vei som fører til livet.\nDere konfirmanter vil fortsatt være omsluttet av menighetens forbønn. Gud er trofast og hans kjærlighet uten grenser. Også i tider med likegyldighet, nederlag og tvil vil Gud være dere nær og kalle dere til samfunn med seg. Hold dere nær til ham. Da vil han, som begynte en god gjerning i dere, fullføre den – helt til Jesu Kristi dag."
						},
						{
							"label": "B",
							"text": "Kristus har kalt oss til å leve i troen på hans oppstandelse og være hans vitner i verden.\nBli i hans kjærlighet og i fellesskapet med alle som tror på ham.\nLa oss alltid be for hverandre, og sammen med Kristus gå\nfremtiden i møte."
						},
						{
							"label": "C",
							"text": "Gud kaller oss til et liv i tro, håp og kjærlighet.\nLa oss sammen søke Gud i bønn, tilbedelse og tjeneste.\nMå Gud styrke oss med sin nåde til det evige liv."
						}
					],
					"selAlt": 0,
					"text": ""
				}
			]
		},
		{
			"title": "III. Nattverd",
			"alternativer": [
				"nattverd"
			],
			"items": [
				{
					"id": "n20",
					"type": "salme",
					"heading": "20 Forberedelse av måltidet – Nattverdsalme",
					"instr": "Bordet dekkes. Brød legges på disken og vin helles i begeret. Takkofferet kan samles inn her. Ofringen avsluttes med: L | Velsignet er du, Gud. Din er jorden og alt som fyller den. … Ta imot oss og våre gaver i Jesu navn. Amen.",
					"text": ""
				},
				{
					"id": "nattverd-prefasjonsdialog",
					"type": "tekst",
					"heading": "Prefasjonsdialog",
					"optional": false,
					"text": "{{r}}L |{{/r}} synger eller sier: Herren være med dere.\n{{r}}M | reiser seg og synger: {{/r}}Og med deg være Herren.\n{{r}}L |{{/r}} Løft deres hjerter.\n{{r}}M |{{/r}} Vi løfter våre hjerter til Herren.\n{{r}}L |{{/r}} La oss takke Herren vår Gud.\n{{r}}M |{{/r}} Det er verdig og rett.",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "nattverd-prefasjon",
					"type": "tekst",
					"heading": "* 21 Prefasjon",
					"optional": true,
					"text": "",
					"alts": [
						{
							"label": "Advent",
							"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som du sendte til frelse for verden for å oppfylle de løfter du gav ditt folk gjennom profetene. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
						},
						{
							"label": "Jul og Maria budskapsdag",
							"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som for vår skyld ble menneske for at vi skulle bli dine barn, frelst ut av mørket og inn i ditt underfulle lys. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
						},
						{
							"label": "Åpenbaringstiden",
							"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som åpenbarte din herlighet for verden, så den som følger ham ikke skal vandre i mørket, men ha lys og evig liv. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
						},
						{
							"label": "Faste",
							"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som elsket oss og gav seg selv for oss, så han ble lydig til døden, ja døden på korset. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
						},
						{
							"label": "Påske",
							"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre. Han er det rette påskelam, som har båret våre synder, og ved sin oppstandelse har han seiret over døden. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
						},
						{
							"label": "Kristi himmelfartsdag og søndag før pinse",
							"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som fór opp til himmelen og nå sitter ved din høyre hånd. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
						},
						{
							"label": "Pinse",
							"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som troner ved din høyre hånd og har sendt Den hellige ånd over sine vitner, så ditt folk kan juble av glede og forkynne dine store gjerninger på mange tungemål. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
						},
						{
							"label": "Treenighetstiden 1",
							"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som du sendte til frelse for verden, for at vi ved hans død skulle få tilgivelse for syndene og ved hans oppstandelse vinne det evige liv. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
						},
						{
							"label": "Allehelgensdag, martyrdager",
							"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som var frelser og forbilde for alle dine hellige som har fullført løpet og bevart troen. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
						},
						{
							"label": "Nattverdbønn a (omarbeidet fra høymessen 1977)",
							"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som du sendte til frelse for verden, for at vi ved hans død skulle få tilgivelse for syndene og ved hans oppstandelse vinne det evige liv. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
						},
						{
							"label": "Nattverdbønn b (etter Hippolyt, 200-tallet)",
							"text": "Vi takker deg, Gud, ved din elskede Sønn Jesus Kristus. Han er det evige Ord, og ved dette Ord skapte du alt. Da tiden var inne, sendte du ham til verden som frelser og befrier. For dette priser vi deg, sammen med alle dine hellige i himmelen og på jorden:"
						},
						{
							"label": "Nattverdbønn c (paulinske tekster)",
							"text": "Å, dyp av rikdom og visdom og kunnskap hos deg, Gud! Himlene forteller om din herlighet, og jorden vitner om dine henders verk. Sammen med de troende gjennom alle tider vil vi prise ditt hellige navn:"
						},
						{
							"label": "Nattverdbønn d (Emmausfortellingen, Luk 24)",
							"text": "Vi priser deg, evige Gud, du som har skapt verden og alt som er i den. Det er i deg vi lever, beveger oss og er til. Sammen med din menighet i himmelen og på jorden lovsynger vi ditt hellige navn:"
						},
						{
							"label": "Nattverdbønn e (bearbeidet etter familiemessen 2003)",
							"text": "Vi takker deg, gode Gud, du som holder himmel og jord i dine hender. Du har skapt oss i ditt bilde og gitt oss livet i gave. Sammen med englene og din menighet i himmelen og på jorden lovsynger vi ditt hellige navn:"
						},
						{
							"label": "Nattverdbønn f (kort – ved særskilte anledninger)",
							"text": "Gode Gud, du har skapt oss og kalt oss ved navn. Du åpner din hånd og metter alt som lever med det gode. Sammen med din menighet i himmelen og på jorden lovsynger vi ditt hellige navn:"
						},
						{
							"label": "Nattverdbønn g (Gudstjenesteboken 1992, Johannesordningen)",
							"text": "Evige, allmektige Gud, du holder himmel og jord i dine hender, du nevner oss alle ved navn, så vi skal tilhøre deg og være ditt folk på jorden. Sammen med de troende gjennom alle tider og med de himmelske hærskarer vil vi prise ditt hellige navn:"
						}
					],
					"selAlt": 0
				},
				{
					"id": "nattverd-sanctus",
					"type": "tekst",
					"heading": "Sanctus",
					"optional": false,
					"text": "",
					"alts": [
						{
							"label": "Allmenn serie 1, 2, fest- og fasteserien",
							"text": "{{r}}A |{{/r}} synger: Hellig, hellig, hellig, er Herren Sebaot. All jorden er full\nav din herlighet. Hosianna i det høyeste. Velsignet være han som kommer i Herrens navn. Hosianna i det høyeste."
						},
						{
							"label": "Allmenn serie 3",
							"text": "ML og A synger\n{{r}}ML |{{/r}} Hellig, hellig, hellig er Herren vår Gud.\n{{r}}A |{{/r}} Omkved: Hellig, hellig, hellig er Herren vår Gud.\n{{r}}ML |{{/r}} Du er Herre over himmel og jord.\n{{r}}A |{{/r}} Omkved\n{{r}}ML |{{/r}} Du er herlig og mektig og stor.\n{{r}}A |{{/r}} Omkved\n{{r}}ML |{{/r}} Du har sendt oss Jesus Kristus, din Sønn.\n{{r}}A |{{/r}} Omkved\n{{r}}ML |{{/r}} Velsignet han som kommer i Herrens navn.\n{{r}}A |{{/r}} Omkved"
						}
					],
					"selAlt": 0
				},
				{
					"id": "nattverd-epiklese",
					"type": "tekst",
					"heading": "Epiklese",
					"optional": true,
					"text": "",
					"alts": [
						{
							"label": "Nattverdbønn a (omarbeidet fra høymessen 1977)",
							"text": "Vi priser deg, hellige Gud, himmelens og jordens Skaper, du som har elsket verden og gitt din Sønn, Jesus Kristus, for at han skulle frelse oss fra synd og død og vinne deg et hellig folk.\n{{r}}L |{{/r}} Vi ber deg: Send din Ånd over disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen."
						},
						{
							"label": "Nattverdbønn b (etter Hippolyt, 200-tallet)",
							"text": "Vi priser deg Gud for Jesus Kristus, din tjener. Han kom fra himmelen, og ved Den hellige ånd og jomfru Maria ble han menneske av kjøtt og blod. Han oppfylte din vilje da han strakte ut sine hender på korsets tre. Slik tilintetgjorde han døden, brøt ondskapens lenker og åpenbarte oppstandelsen fra de døde. Derfor minnes vi hans død og oppstandelse når vi bærer brødet og vinen fram for deg.\n{{r}}L |{{/r}} Vi ber deg: Send din hellige Ånd over disse gaver, så de for oss blir livets brød og frelsens beger."
						},
						{
							"label": "Nattverdbønn c (paulinske tekster)",
							"text": "Hellig og barmhjertig er du, Gud, som ikke vendte deg bort da mennesket syndet, men gav løfte til Abraham om velsignelse for alle folkeslag. Mektig og trofast er du, som befridde ditt folk fra trelldom, og fornyet løftene gjennom profetene.\nDa tiden var inne, sendte du din Sønn, født av Maria, for å kjøpe oss fri og gi oss retten til å være dine barn.\nVed hans død på korset forsonte du alt med deg selv og skapte fred, og ved hans oppstandelse ble døden overvunnet.\n{{r}}L |{{/r}} Vi ber deg: Send din Ånd over disse dine gaver. Foren oss i troen på din nåde, så vi kan ta imot Jesu legeme og blod til forsoning og fred, og forkynne hans død til han kommer."
						},
						{
							"label": "Nattverdbønn d (Emmausfortellingen, Luk 24)",
							"text": "Vi takker deg, all godhets kilde. Du sendte din Sønn. Han ble korsfestet og stod opp fra de døde. Han åpnet skriftene og åpenbarte seg for sine venner da han brøt brødet og gav dem.\n{{r}}L |{{/r}} Nå ber vi deg: La din hellige Ånd komme over brødet og vinen, så våre øyne åpnes, og vi kjenner ham igjen som vår korsfestede og oppstandne Frelser."
						},
						{
							"label": "Nattverdbønn e (bearbeidet etter familiemessen 2003)",
							"text": "Hellige Gud, vi takker deg for Jesus Kristus, verdens frelser. Han døde og stod opp igjen for å gi oss evig liv. Vi takker deg for dåpens gave, der vi blir født på ny, og for nattverden, der du samler oss som din store familie.\n{{r}}L |{{/r}} Vi ber deg: Send din hellige Ånd over brødet og vinen. Gjør oss til ett med hverandre og med Jesus Kristus."
						},
						{
							"label": "Nattverdbønn f (kort – ved særskilte anledninger)",
							"text": "Vi takker deg for Jesus Kristus, vår frelser. Han er det levende brød som kommer ned fra himmelen og gir verden liv.\n{{r}}L |{{/r}} Vi ber deg: Send din Ånd over oss og disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen."
						},
						{
							"label": "Nattverdbønn g (Gudstjenesteboken 1992, Johannesordningen)",
							"text": "Hellige Gud, uten ende er din miskunn, og evig er ditt herredømme. Du har fylt ditt skaperverk med lys og liv; himmelen og jorden er fulle av din herlighet. Gjennom Abraham lovte du å velsigne alle folkeslag. Du berget Israel, ditt utvalgte folk. Gjennom profetene fornyet du ditt løfte. Og da tiden var kommet, sendte du din Sønn, han som i ord og gjerning forkynte ditt rike og var lydig mot din vilje helt til døden.\n{{r}}L |{{/r}} Vi ber deg: Send din Ånd over disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen."
						}
					],
					"selAlt": 0
				},
				{
					"id": "nattverd-verba",
					"type": "tekst",
					"heading": "Innstiftelsesordene VERBA",
					"optional": true,
					"text": "",
					"alts": [
						{
							"label": "Nattverdbønn a (omarbeidet fra høymessen 1977)",
							"text": "Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg."
						},
						{
							"label": "Nattverdbønn b (etter Hippolyt, 200-tallet)",
							"text": "Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg."
						},
						{
							"label": "Nattverdbønn c (paulinske tekster)",
							"text": "Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg."
						},
						{
							"label": "Nattverdbønn d (Emmausfortellingen, Luk 24)",
							"text": "Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg."
						},
						{
							"label": "Nattverdbønn e (bearbeidet etter familiemessen 2003)",
							"text": "Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg."
						},
						{
							"label": "Nattverdbønn f (kort – ved særskilte anledninger)",
							"text": "Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg."
						},
						{
							"label": "Nattverdbønn g (Gudstjenesteboken 1992, Johannesordningen)",
							"text": "Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\n{{r}}L/ML |{{/r}} Derfor, så ofte som vi spiser dette brødet og drikker av begeret, forkynner vi Herrens død, inntil han kommer."
						}
					],
					"selAlt": 0
				},
				{
					"id": "nattverd-troens-mysterium",
					"type": "tekst",
					"heading": "Troens mysterium",
					"optional": false,
					"text": "{{r}}L |{{/r}} Stort er troens mysterium.\n{{r}}A |{{/r}} Kristus døde. Kristus stod opp. Kristus skal komme igjen. Ham være ære for kjærligheten som er sterkere enn døden.",
					"instr": "Synges eller fremsies.",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "nattverd-avslutning",
					"type": "tekst",
					"heading": "Avslutning",
					"optional": true,
					"text": "",
					"alts": [
						{
							"label": "Nattverdbønn a (omarbeidet fra høymessen 1977)",
							"text": "Nådige Gud, vi feirer dette måltidet med glede og takk for din Sønns fullbrakte offer, i troen på hans seierrike oppstandelse og himmelfart og i forventning om hans gjenkomst i herlighet. Vi ber deg: Fyll oss med din Ånd og kjærlighet, så vi kan gjenkjenne Kristus i den som sulter og tørster. Lær oss å elske hverandre som han har elsket oss, og la oss en gang samles hos deg i ditt fullendte rike."
						},
						{
							"label": "Nattverdbønn b (etter Hippolyt, 200-tallet)",
							"text": "La alle som får del i brødet og vinen, forenes til ett. Fyll oss med din hellige Ånd og grunnfest oss i sannheten, så vi kan prise deg i din hellige kirke nå og i all evighet."
						},
						{
							"label": "Nattverdbønn c (paulinske tekster)",
							"text": "Evige Gud, forny oss ved din Ånd. Sammen med alt som er skapt, venter vi med lengsel på å bli frigjort fra forgjengelighet og få del i den frihet som dine barn skal eie i herligheten. Fra deg og ved deg og til deg er alle ting. Deg være ære i all evighet!"
						},
						{
							"label": "Nattverdbønn d (Emmausfortellingen, Luk 24)",
							"text": "Hellige Gud, fyll oss med din Ånd. Gi oss brennende hjerter, så vi i undring og glede tar vare på ditt ord og viser barmhjertighet mot den som lider. Bli hos oss, også når vi tviler og sørger. Gå med oss, inntil savn og smerte har veket for evig jubel og lovsang."
						},
						{
							"label": "Nattverdbønn e (bearbeidet etter familiemessen 2003)",
							"text": "Gud, fyll oss med din Ånd. Ta oss alle i favn, slik en kjærlig mor samler barna sine om seg. La de små bli opphøyet og de sultne bli mettet med gode gaver.\nLiturgen og/eller ett eller flere barn synger eller sier: Sammen med alle dine barn ber vi den bønn som din Sønn har lært oss:"
						},
						{
							"label": "Nattverdbønn f (kort – ved særskilte anledninger)",
							"text": "Sammen med alle dine barn ber vi den bønn som din Sønn har lært oss:"
						},
						{
							"label": "Nattverdbønn g (Gudstjenesteboken 1992, Johannesordningen)",
							"text": "Derfor, barmhjertige Far, vil vi med dette brødet og dette begeret komme i hu at Herren gav sitt liv for oss. Og i troen på hans oppstandelse venter vi på at han kommer igjen i makt og herlighet og vil holde sitt store gjestebud sammen med sitt folk.\n{{r}}A |{{/r}} Amen, ja, kom, Herre Jesus.\n{{r}}L |{{/r}} Vi ber deg, allmektige Gud, gi oss din hellige Ånd. La oss kjenne kraften av Kristi oppstandelse, så vi som tar imot hans legeme og blod, kan leve til pris og ære for din herlighet og få del i den arven som de hellige får i lyset.\n{{r}}A |{{/r}} Amen, ja, kom, du Hellige Ånd.\n{{r}}L/ML |{{/r}} Foren vår bønn med bønnene fra dine tjenere alle steder og gjennom alle tider, og med forbønnen fra vår store øversteprest, som alltid ber for oss, inntil han kommer med seier, som Herren over alle ting. Ved ham og i ham og i samfunn med Den hellige ånd skal du ha all herlighet og ære, allmektige Far, evige Gud, nå og til evig tid."
						}
					],
					"selAlt": 0
				},
				{
					"id": "n21b",
					"type": "tekst",
					"heading": "Fadervår",
					"instr": "Fremsies eller synges (N13: 984.1 og 3, 985.1 og 3). Kan erstattes av Fadervår etter 1977- eller 1920-liturgiene.",
					"text": "{{r}}A |{{/r}} Vår Far i himmelen! La navnet ditt helliges. La riket ditt komme.\nLa viljen din skje på jorden slik som i himmelen. Gi oss i dag vårt daglige brød,\nog tilgi oss vår skyld, slik også vi tilgir våre skyldnere. Og la oss ikke komme i fristelse, men frels oss fra det onde.\nFor riket er ditt og makten og æren i evighet. Amen.",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "n22a",
					"type": "tekst",
					"heading": "* 22 Fredshilsen PAX",
					"instr": "Menigheten står helt til de første går fram til nattverd. Her kan en føye til: L/ML | La oss hilse hverandre med et tegn på fred. Menigheten hilser hverandre med håndtrykk.",
					"text": "{{r}}L |{{/r}} Guds fred være med dere.\n{{r}}M |{{/r}} Guds fred være med deg.",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "n22b",
					"type": "tekst",
					"heading": "Du Guds Lam AGNUS DEI",
					"alts": [
						{
							"label": "Allmenn serie 1, 2, fest- og fasteserien",
							"text": "{{r}}A |{{/r}} Du Guds Lam, som bærer verdens synder, miskunne deg over oss.\nDu Guds Lam, som bærer verdens synder, miskunne deg over oss.\nDu Guds Lam, som bærer verdens synder, gi oss din fred."
						},
						{
							"label": "Allmenn serie 3",
							"text": "{{r}}ML |{{/r}} Amen, kom, Herre Jesus. A | Omkved: Amen, kom, Herre Jesus.\n{{r}}ML |{{/r}} Du er Lammet som bærer vår synd. A | Omkved\n{{r}}ML |{{/r}} Du er Lammet som gir oss din fred. A | Omkved\n{{r}}ML |{{/r}} Du er brødet som gir oss ditt liv. A | Omkved"
						}
					],
					"text": "",
					"selAlt": 0
				},
				{
					"id": "n22c",
					"type": "tekst",
					"heading": "Invitasjon og utdeling",
					"instr": "{{r}}L |{{/r}} Kom, for alt er gjort ferdig. (Kan alternativt gis før Du Guds Lam synges.) Utdelingsordet: Kristi kropp, gitt for deg. Kristi blod, gitt for deg. (Alternativt: Dette er Jesu legeme. Dette er Jesu blod.)\nEtter utdelingen:\n{{r}}L |{{/r}} Den korsfestede og oppstandne Jesus Kristus har nå gitt oss sin kropp og sitt blod som han gav til soning for alle våre synder.\nA (eller L) | Han styrke oss og holde oss oppe i en sann tro til det evige liv.\n{{r}}L |{{/r}} Fred være med dere.",
					"text": "",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "n23",
					"type": "tekst",
					"heading": "23 Måltidets avslutning – Takkebønn",
					"instr": "Innledes med L/ML | La oss takke og be. Alteret ryddes.",
					"alts": [
						{
							"label": "Takkebønn 1 (kan synges)",
							"text": "{{r}}L/ML |{{/r}} Vi takker deg, himmelske Far, for dine velsignede gaver.\nVi ber deg at du ved disse gavene vil bevare oss i troen på deg, forene oss i din kjærlighet og stadfeste i oss håpet om det evige liv, for Jesu Kristi skyld.\n{{r}}M |{{/r}} Amen."
						},
						{
							"label": "Takkebønn 2",
							"text": "{{r}}L/ML |{{/r}} Vi takker deg, visdommens Gud, for ditt måltids dype hemmelighet: Brødet vi har brutt, er ett. Din Sønn har gitt sitt liv for én verden og én menneskehet. Vi ber:\nA/L/ML | Hjelp oss å høre det ropet du har hørt, å se den nøden du har sett, og å elske vår neste som oss selv."
						},
						{
							"label": "Takkebønn 3",
							"text": "{{r}}L/ML |{{/r}} Vi takker deg, nådige Gud, du som gjennom brødet og vinen har gitt oss del i Jesu Kristi seierrike død og oppstandelse. Vi ber:\nA/L/ML | Styrk oss ved din Ånd til vitnesbyrd og tjeneste i verden."
						},
						{
							"label": "Takkebønn 4",
							"text": "{{r}}L/ML |{{/r}} Trofaste Gud, du som i dåpen har gitt oss barnekår og gjort oss til arvinger i ditt rike. Vi takker deg for dette måltidet, hvor du har gitt oss syndenes forlatelse og fornyet i oss troen på dine løfter. Vi ber:\nA/L/ML | Styrk oss ved din Ånd til vitnesbyrd og tjeneste i verden."
						}
					],
					"text": "",
					"selAlt": 0
				}
			],
			"__lenket": {
				"malId": "hovedgudstjeneste2020",
				"tittel": "III. Nattverd"
			}
		},
		{
			"title": "IV. Sendelse",
			"items": [
				{
					"id": "konf21-25",
					"type": "tekst",
					"heading": "24 Sluttsalme",
					"instr": "Her kan følge en symbolhandling dersom denne ikke ble lagt til forbønnshandlingen, ledd 18 C.",
					"text": "",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-26",
					"type": "tekst",
					"heading": "25 Velsignelse",
					"text": "",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-27",
					"type": "tekst",
					"heading": "26 Utsendelse",
					"text": "",
					"alts": [],
					"selAlt": 0
				},
				{
					"id": "konf21-28",
					"type": "instruks",
					"heading": "27 Postludium/Utgangsprosesjon",
					"instr": "Konfirmantene forlater kirken i utgangsprosesjon, fulgt av medliturg(er) og liturg. Der det er korsbærer går denne først i prosesjonen.",
					"text": "",
					"alts": [],
					"selAlt": 0
				}
			]
		}
	],
	"erOriginal": true,
	"malForm": "bokmål",
	"visInstr": true,
	"visRoles": true,
	"visSalmeinfo": true,
	"alternativer": [
		"nattverd"
	]
}
]

/** DEAKTIVERTE MALER - ikke publisert med appen, men ligger her hvis den
 *  skal genereres på nytt (flytt den inn i BUILTIN_TEMPLATES og slett
 *  mal-filen på disk for å re-seede). */
export const DEAKTIVERTE_MALER = [
	{
		"id": "bakke-gyland-2025",
		"builtinKey": "bakke-gyland-2025",
		"kind": "template",
		"name": "Gudstjenestemal Bakke og Gyland 2025",
		"description": "Lokal grunnordning for Bakke og Gyland menighet",
		"sections": [
			{
				"title": "I. Samling",
				"items": [
					{
						"id": "l-1",
						"type": "instruks",
						"heading": "Forberedelse",
						"text": "",
						"instr": "Klokkeringing\n\nInformasjon om dagens gudstjeneste\n\nTre klokkeslag",
						"alts": [],
						"optional": true,
						"enabled": false,
						"selAlt": 0
					},
					{
						"id": "l-2",
						"type": "salme",
						"heading": "Inngangssalme",
						"text": "",
						"instr": "",
						"alts": [],
						"optional": false,
						"salmeNr": "",
						"salmeTittel": ""
					},
					{
						"id": "l-3",
						"type": "tekst",
						"heading": "Hilsen",
						"text": "",
						"instr": "",
						"alts": [
							{
								"bibDup": true,
								"label": "Bakke og Gyland",
								"text": "{{r}}L |{{/r}} Kjære menighet.\nNåde være med dere og fred fra Gud, vår Far, og Herren Jesus Kristus."
							},
							{
								"bibDup": true,
								"label": "Nåde være med dere og fred",
								"text": "{{r}}L |{{/r}} Nåde være med dere og fred\nfra Gud, vår Far, og Herren Jesus Kristus."
							},
							{
								"bibDup": true,
								"label": "Vår Herre Jesu Kristi nåde …",
								"text": "{{r}}L |{{/r}} Vår Herre Jesu Kristi nåde, Guds kjærlighet\nog Den hellige ånds samfunn være med dere alle."
							},
							{
								"bibDup": true,
								"label": "I Faderens og Sønnens og Den hellige ånds navn",
								"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den hellige ånds navn."
							},
							{
								"bibDup": true,
								"label": "I Faderens og Sønnens og Den hellige ånds navn: Vår skaper …",
								"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den hellige ånds navn:\nVår skaper, frigjører og livgiver."
							}
						],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-4",
						"type": "tekst",
						"heading": "Dagens bønn/Samlingsbønn",
						"text": "",
						"instr": "Samlingsbønn velges. Den lokale Bakke og Gyland-bønnen har egen innledning; de tre samlingsbønnene innledes med «ML | La oss be.» og avsluttes med «ML | Gud, vi ber. / A | Amen.»",
						"alts": [
							{
								"label": "Bakke og Gyland",
								"text": "{{r}}L |{{/r}} La oss alle be.\nTrofaste Gud,\ndu elsker oss som en kjærlig mor og far.\nVi ber deg:\nLær oss å lytte til dine ord,\nså vi blir rike på innsikt og kjærlighet,\nved din Sønn Jesus Kristus, vår Herre,\nsom med deg og Den hellige ånd lever og råder,\nén sann Gud fra evighet til evighet.\n{{r}}A |{{/r}} Amen"
							},
							{
								"bibDup": true,
								"label": "Samlingsbønn 1",
								"text": "{{r}}ML |{{/r}} Gud, vi er kommet inn i ditt hellige hus for å ta imot det du vil gi oss.\nLukk nå opp våre hjerter, så vi kan fornyes i troen på deg."
							},
							{
								"bibDup": true,
								"label": "Samlingsbønn 2",
								"text": "{{r}}ML |{{/r}} Hellige Gud, vi er samlet for ditt ansikt for å møte din kjærlighet og sannhet.\nSend oss din Ånd og gjør oss åpne for det du vil gi oss. La ditt ord slå rot i våre hjerter, så Kristus lever i oss, og vi blir ett i deg og tjener deg i alle ting."
							},
							{
								"bibDup": true,
								"label": "Samlingsbønn 3",
								"text": "{{r}}ML |{{/r}} Gode Gud, du som gir liv til alt som lever, vi priser deg for jordens skjønnhet,\nog for alt som lar oss kjenne at du er god.\nHer for ditt ansikt ber vi: Gi oss lyttende ører, takknemlige hjerter og tjenende hender, så vi kan høre ditt ord, lovprise deg for din godhet, og i ord og gjerning vitne om dine storverk."
							}
						],
						"optional": false,
						"selAlt": 0,
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}ML |{{/r}} La oss be."
							}
						],
						"avslutningAlts": [
							{
								"label": "Avslutning",
								"text": "{{r}}ML |{{/r}} Gud, vi ber.\n{{r}}A |{{/r}} Amen."
							}
						],
						"selIntro": 0,
						"selAvsl": 0
					},
					{
						"id": "l-6",
						"type": "tekst",
						"heading": "Syndsbekjennelse",
						"text": "",
						"instr": "Følger her, eller etter talen. Liturgen kneler under syndsbekjennelse og stillhet. Også menigheten kan knele.",
						"alts": [
							{
								"bibDup": true,
								"label": "a – Gud, vær meg nådig! (full)",
								"text": "{{r}}A |{{/r}} Gud, vær meg nådig!\nJeg har syndet mot deg og sviktet min neste\n– med tanker og ord, med det jeg har gjort, og med det jeg har forsømt.\nTilgi meg min synd for Jesu Kristi skyld. Skap i meg et rent hjerte,\nog gi meg kraft til nytt liv ved din hellige Ånd."
							},
							{
								"bibDup": true,
								"label": "b – Gud, vær meg nådig! (kort)",
								"text": "{{r}}A |{{/r}} Gud, vær meg nådig!\nTilgi meg min synd for Jesu Kristi skyld. Skap i meg et rent hjerte,\nog gi meg kraft til nytt liv ved din hellige Ånd."
							},
							{
								"bibDup": true,
								"label": "c – Gud, du kjenner og elsker oss alle",
								"text": "{{r}}A |{{/r}} Gud, du kjenner og elsker oss alle. Du vil at vi skal ta vare på hverandre og på jorden.\nVi vet at vi svikter og gjør deg imot. Tilgi oss og hjelp oss, for Jesu skyld."
							},
							{
								"bibDup": true,
								"label": "d – Hellige Gud, vår skaper",
								"text": "{{r}}A |{{/r}} Hellige Gud, vår skaper, se i nåde til oss.\nVi har syndet mot deg og brutt dine bud.\nTilgi oss for Jesu Kristi skyld. Sett oss fri til å tjene deg, verne om skaperverket og møte vår neste med kjærlighet."
							},
							{
								"bibDup": true,
								"label": "Syndsbekjennelse fra 1977-ordningen",
								"text": "Hellige Gud, himmelske Far, se i nåde til meg, syndige menneske, som har krenket deg med tanker, ord og gjerninger og kjenner lysten til det onde i mitt hjerte.\nFor Jesu Kristi skyld, ha langmodighet med meg.\nTilgi meg alle mine synder, og gi meg å frykte og elske deg alene."
							}
						],
						"optional": false,
						"introAlts": [
							{
								"label": "Bakke og Gyland",
								"text": "{{r}}L |{{/r}} Vår Herre Jesus Kristus sier: Du skal elske Herren din Gud av hele ditt hjerte\nog av hele din sjel og av all din forstand. Dette er det største og første budet.\nMen det andre er like stort: Du skal elske din neste som deg selv.\nBIBELREF | Matt 22,37-39"
							},
							{
								"label": "La oss bøye oss og bekjenne",
								"text": "{{r}}L |{{/r}} La oss bøye oss for Gud og bekjenne våre synder."
							},
							{
								"label": "La oss bøye oss og be om tilgivelse",
								"text": "{{r}}L |{{/r}} La oss bøye oss for Gud og be om tilgivelse."
							},
							{
								"label": "I tillit og bekjenne",
								"text": "{{r}}L |{{/r}} I tillit til Guds nåde vil vi bekjenne våre synder."
							},
							{
								"label": "I tillit og be om tilgivelse",
								"text": "{{r}}L |{{/r}} I tillit til Guds nåde vil vi be om tilgivelse."
							}
						],
						"avslutningAlts": [
							{
								"label": "Løftesord 1 Joh 1,9",
								"text": "{{r}}L |{{/r}} Guds ord sier: Dersom vi bekjenner våre synder, er han trofast og rettferdig, så han tilgir oss syndene og renser oss for all urett.\nBIBELREF | 1 Joh 1,9"
							},
							{
								"label": "Løftesord Sal 103,11-12",
								"text": "{{r}}L |{{/r}} Så høy som himmelen er over jorden, så veldig er hans miskunn over dem som frykter ham. Så langt som øst er fra vest, tar han syndene våre bort fra oss.\nBIBELREF | Sal 103,11-12"
							}
						],
						"selAlt": 0,
						"selIntro": 0,
						"selAvsl": 0
					},
					{
						"id": "l-8",
						"type": "tekst",
						"heading": "Bønnerop Kyrie",
						"text": "",
						"instr": "",
						"alts": [
							{
								"label": "Bakke og Gyland",
								"text": "{{r}}A |{{/r}} Kyrie eleison. Gud Fader, miskunne deg.\nKriste eleison. Herre Krist, miskunne deg.\nKyrie eleison. Hellig Ånd, miskunne deg."
							},
							{
								"bibDup": true,
								"label": "Allmenn serie 1",
								"text": "{{r}}A |{{/r}} Kyrie eleison. Gud Fader, miskunne deg. Kriste eleison. Herre Krist, miskunne deg. Kyrie eleison. Hellig Ånd, miskunne deg.\n{{r}}L/ML |{{/r}} Ære være Gud i det høyeste\n{{r}}A |{{/r}} og fred på jorden blant mennesker som Gud har glede i. Vi lover deg, vi priser deg, vi tilber deg, vi opphøyer deg. Amen."
							},
							{
								"bibDup": true,
								"label": "Allmenn serie 2",
								"text": "{{r}}A |{{/r}} Kyrie eleison. Miskunne deg over oss.\nKriste eleison. Miskunne deg over oss. Kyrie eleison. Miskunne deg over oss.\n{{r}}L/ML |{{/r}} Ære være Gud i det høyeste\n{{r}}A |{{/r}} og fred på jorden blant mennesker som Gud har glede i. Vi lover deg, vi priser deg, vi tilber deg, vi opphøyer deg. Amen."
							},
							{
								"bibDup": true,
								"label": "Allmenn serie 3",
								"text": "{{r}}ML |{{/r}} Herre, miskunne deg. M | Herre, miskunne deg. ML | Kristus, miskunne deg. M | Kristus, miskunne deg. ML | Herre, miskunne deg. M | Herre, miskunne deg.\n{{r}}L/ML |{{/r}} Ære være Gud i det høyeste.\n{{r}}M |{{/r}} Ære være Gud i det høyeste.\n{{r}}ML |{{/r}} Herre, vi lover, Herre, vi priser deg.\n{{r}}M |{{/r}} Ære være Gud i det høyeste. Amen."
							},
							{
								"bibDup": true,
								"label": "Serie for festtidene",
								"text": "{{r}}ML |{{/r}} Kyrie eleison. M | Kyrie eleison. ML | Kriste eleison. M | Kriste eleison. ML | Kyrie eleison. M | Kyrie eleison.\n{{r}}L/ML |{{/r}} Ære være Gud i det høyeste\n{{r}}A |{{/r}} og fred på jorden blant mennesker som Gud har glede i. Vi lover deg, vi priser deg, vi tilber deg, vi opphøyer deg. Amen."
							},
							{
								"bibDup": true,
								"label": "Serie for fastetiden (uten gloria)",
								"text": "{{r}}A |{{/r}} Kyrie eleison. Herre, miskunne deg.\nKriste eleison. Kristus, miskunne deg. Kyrie eleison. Herre, miskunne deg."
							}
						],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-9",
						"type": "tekst",
						"heading": "Lovsang Gloria",
						"text": "{{r}}L |{{/r}} Ære være Gud i det høyeste\nA  og fred på jorden blant mennesker som Gud har glede i.\nVi lover deg, vi priser deg, vi tilber deg, vi opphøyer deg. Amen.",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": false,
						"selAlt": 0
					}
				]
			},
			{
				"title": "Dåp",
				"items": [
					{
						"id": "l-10",
						"type": "instruks",
						"heading": "DÅP",
						"text": "",
						"instr": "Dåp i hovedgudstjenesten skjer normalt her. Forbered dåpsvann, dåpslys og verger.",
						"alts": [],
						"optional": false,
						"enabled": false,
						"selAlt": 0
					},
					{
						"id": "l-11",
						"type": "tekst",
						"heading": "Dåp: Inngangsord",
						"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den hellige ånds navn.",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-12",
						"type": "tekst",
						"heading": "Dåp: Mottakelse til dåp",
						"text": "{{r}}L |{{/r}} Med takk og glede bringer vi i dag dette barnet/disse barna til Gud i den hellige dåp. I dåpen tar Gud imot oss og forener oss med den korsfestede og oppstandne Jesus Kristus.\nFølgende skriftord kan leses:\n{{r}}L |{{/r}} For så høyt har Gud elsket verden at han ga sin Sønn, den enbårne, for at hver den som tror på ham, ikke skal gå fortapt, men ha evig liv. Joh3,16",
						"instr": "",
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-13",
						"type": "tekst",
						"heading": "Dåp: Bibelord",
						"text": "{{r}}L |{{/r}} La oss høre hvor vennlig Jesus tar imot barna og åpner Guds rike for oss:\nKlokker / dåpsfølge  De bar små barn til ham for at han skulle røre ved dem, men disiplene viste dem bort. Da Jesus så det, ble han sint og sa til dem: «La de små barna komme til meg, og hindre dem ikke! For Guds rike tilhører slike som dem. Sannelig, jeg sier dere: Den som ikke tar imot Guds rike slik som et lite barn, skal ikke komme inn i det.» Og han tok dem inn til seg, la hendene på dem og velsignet dem.\nBIBELREF | Mark 10,13-16",
						"instr": "",
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-14",
						"type": "salme",
						"heading": "Dåp: Evt. dåpssalme",
						"text": "",
						"instr": "",
						"alts": [],
						"optional": false,
						"salmeNr": "",
						"salmeTittel": "",
						"enabled": false
					},
					{
						"id": "l-15",
						"type": "tekst",
						"heading": "Dåp: Dåpsbefalingen",
						"text": "{{r}}L |{{/r}} La oss høre vår Herre Jesu Kristi ord om dåpen og troen:\nKlokker / dåpsfølge  Jeg har fått all makt i himmelen og på jorden. Gå derfor og gjør alle folkeslag til disipler: Døp dem til Faderens og Sønnens og Den hellige ånds navn og lær dem å holde alt det jeg har befalt dere. Og se, jeg er med dere alle dager inntil verdens ende.\nBIBELREF | Matt 28,18-20",
						"instr": "",
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-16",
						"type": "tekst",
						"heading": "Dåp: Fadderansvaret",
						"text": "{{r}}L |{{/r}} Vil foreldre og faddere reise seg.\nDere skal være vitner om at dette barnet/disse barna er døpt med den kristne dåp. Sammen med vår menighet og hele kirken får dere del i et hellig ansvar: å vise omsorg for henne/ham/dem, be for henne/ham/dem, lære henne/ham/dem selv å be og hjelpe henne/ham/dem til å bruke Guds ord og delta i den hellige nattverd, så hun/han/de kan leve og vokse i den kristne tro.",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-17",
						"type": "tekst",
						"heading": "Dåp: Forsakelsen og troen",
						"text": "{{r}}L |{{/r}} La oss sammen bekjenne forsakelsen og troen som vi døpes til.\nAlle reiser seg.\n{{r}}A |{{/r}} Jeg forsaker djevelen og alle hans gjerninger og alt hans vesen.\nJeg tror på Gud Fader, den allmektige,\nhimmelens og jordens skaper.\nJeg tror på Jesus Kristus,\nGuds enbårne Sønn, vår Herre,\nsom ble unnfanget ved Den hellige ånd,\nfødt av jomfru Maria,\npint under Pontius Pilatus,\nkorsfestet, død og begravet,\nfór ned til dødsriket,\nstod opp fra de døde tredje dag,\nfór opp til himmelen,\nsitter ved Guds, den allmektige Faders høyre hånd,\nskal derfra komme igjen\nfor å dømme levende og døde.\nJeg tror på Den hellige ånd,\nen hellig, allmenn kirke,\nde helliges samfunn,\nsyndenes forlatelse,\nlegemets oppstandelse\nog det evige liv.\nAmen.",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-18",
						"type": "tekst",
						"heading": "Dåp: Bønn ved døpefonten",
						"text": "{{r}}L |{{/r}} Barmhjertige Gud, vi takker deg for at dåpens vann ved ditt ord er en nådens kilde, der du tilgir oss vår synd, frelser oss fra dødens makt og gir oss løfte om det evige liv. Send din Ånd så hun/han/de som døpes reises opp til det nye livet med Jesus Kristus, vår Herre.",
						"instr": "",
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-19",
						"type": "tekst",
						"heading": "Dåp: Dåpshandlingen",
						"text": "{{r}}L |{{/r}} Hva heter barnet?\nDen som bærer barnet, sier barnets fornavn.\n{{r}}L |{{/r}} Vil dere at NN skal døpes til Faderens og Sønnens og Den hellige ånds navn og oppdras til et liv i den kristne forsakelse og tro?\nDen som bærer barnet, foreldre/foresatte og faddere, svarer:\nJa.\nVed dåp av større barn, unge eller voksne:\n{{r}}L |{{/r}} Hva heter du?\nDen som skal døpes, svarer selv ved å si fornavnet sitt. Om nødvendig kan en annen si navnet.\n{{r}}L |{{/r}} NN, vil du bli døpt til Faderens og Sønnens og Den hellige ånds navn og leve i den kristne forsakelse og tro?\nDen som skal døpes, svarer:\nJa.\nLiturgen vender seg mot barnets/dåpskandidatens ansikt og ber bønnen med åpen håndflate.\n{{r}}L |{{/r}} Gud bevare din utgang og din inngang fra nå og til evig tid.\nJeg tegner deg med det hellige korsets tegn ✠ til vitnesbyrd om at du skal tilhøre den korsfestede og oppstandne Jesus Kristus og tro på ham.\n{{r}}L |{{/r}} NN, etter vår Herre Jesu Kristi ord og befaling døper jeg deg til Faderens og Sønnens og Den hellige ånds navn.\nMens dette sies, øser liturgen med hånden rikelig med vann over hodet til den som døpes, tre ganger.\nLiturgen legger, gjerne sammen med fadderne, hånden på den døptes hode og sier:\n{{r}}L |{{/r}} Den allmektige Gud har i dåpen gitt deg sin hellige Ånd,\nfødt deg på ny og tatt deg inn i sin troende menighet. Gud styrke deg med sin nåde til det evige liv.\nFred være med deg.\nBarnet vendes mot menigheten eller løftes opp. Ved dåp av større barn, unge eller voksne kan disse vende seg mot menigheten. Følgende ord sies:\nDette er NN, Guds barn, døpt inn i vår menighet og Kristi verdensvide kirke.",
						"instr": "",
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-20",
						"type": "tekst",
						"heading": "Dåp: Dåpslyset og dåpsengel",
						"text": "Etter hver dåp og presentasjon kan det tennes et lys. Liturgen kan si:\n{{r}}L |{{/r}} Et lys er tent for NN.\nLysene settes i en lysholder.\nNår alle dåpslysene er tent, sier liturgen:\n{{r}}L |{{/r}} Jesus sier: «Jeg er verdens lys. Den som følger meg, skal ikke vandre i mørket,men ha livets lys.» Joh 8,12",
						"instr": "",
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-21",
						"type": "salme",
						"heading": "Dåp: Velsignelsessang (N13 638)",
						"text": "Må Gud velsigne deg!\nMå Gud velsigne deg!\nHvert minutt av din tid,\nhver en dag av ditt liv.\nMå Gud velsigne deg.\n(Synges 1 gang pr. barn)",
						"instr": "",
						"alts": [],
						"optional": false,
						"salmeNr": "",
						"salmeTittel": ""
					},
					{
						"id": "l-22",
						"type": "tekst",
						"heading": "Dåp: Bønn",
						"text": "{{r}}L |{{/r}} La oss takke og be.\nTrofaste Gud,\nvi takker deg for dåpen,\nder du tar oss inn i din kirke.\nVi ber for NN/barna/dem som er døpt i dag.\nHold din vernende hånd over henne/ham/dem,\nog gi kjærlighet og visdom til alle som har ansvar for henne/ham/dem.\nGud, hør vår bønn.",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-23",
						"type": "tekst",
						"heading": "Dåp: Lovprisning",
						"text": "{{r}}L |{{/r}} Lovet være Gud, vår Herre Jesu Kristi Far, han som i sin rike miskunn har født oss på ny til et levende håp ved Jesu Kristi oppstandelse fra de døde. 1 Pet 1,3",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-24",
						"type": "salme",
						"heading": "Dåp: Evt. dåpssalme e.l.",
						"text": "",
						"instr": "",
						"alts": [],
						"optional": false,
						"salmeNr": "",
						"salmeTittel": "",
						"enabled": false
					}
				]
			},
			{
				"title": "II. Ordet",
				"items": [
					{
						"id": "l-25",
						"type": "tekst",
						"heading": "Innledning Ordet",
						"text": "{{r}}L/ML |{{/r}} La oss høre Herrens ord.",
						"instr": "",
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-26",
						"type": "lesning",
						"heading": "Første lesning",
						"introAlts": [
							{
								"label": "Innledning",
								"text": "Noomi dro bort fra stedet hvor hun hadde bodd, og begge svigerdøtrene fulgte henne.\nDe ga seg i vei for å vende tilbake til Juda. Men Noomi sa til sine to svigerdøtre: «Snu og gå tilbake, hver til sin mors hus! Måtte Herren vise godhet mot dere, slik dere har vist godhet mot de døde og mot meg! Måtte Herren gi dere begge trygghet og la dere finne et hjem, hver i sin manns hus!» Så kysset hun dem. Men de brast i gråt og sa til henne: «Nei, vi vil følge deg tilbake til ditt folk.» Men Noomi sa: «Vend tilbake, mine døtre! Hvorfor skulle dere følge med meg? Skulle jeg ennå føde sønner som dere kan få til menn?»\nMen Rut svarte: «Ikke tving meg til å forlate deg og vende tilbake, for:\nDit du går, vil jeg gå,\nog hvor du bor, vil jeg bo.\nDitt folk er mitt folk,\nog din Gud er min Gud.\nDer du dør, vil jeg dø,\nog der vil jeg begraves.\nMåtte Herren la det gå meg ille\nbåde nå og siden\nhvis noe annet enn døden\nskal skille meg fra deg!»\nDa Noomi så at hun sto fast på sitt og ville følge med henne, sa hun ikke mer til henne.\nSå gikk de begge videre til de kom til Betlehem.\nSlik lyder Herrens ord.\nrut 1,7–11.16–19a"
							},
							{
								"label": "Innledning",
								"text": "{{r}}ML |{{/r}} Det står skrevet i Ruts bok:"
							}
						],
						"avslutningAlts": [
							{
								"label": "Avslutning",
								"text": "{{r}}ML |{{/r}} Slik lyder Herrens ord."
							}
						],
						"selIntro": 0,
						"selAvsl": 0,
						"instr": "Rut 1,7-11.16-19a (eksempel)",
						"alts": [],
						"optional": false,
						"selAlt": 0,
						"text": ""
					},
					{
						"id": "l-27",
						"type": "salme",
						"heading": "Salme",
						"text": "",
						"instr": "",
						"alts": [],
						"optional": false,
						"salmeNr": "",
						"salmeTittel": ""
					},
					{
						"id": "l-28",
						"type": "lesning",
						"heading": "Andre lesning",
						"introAlts": [
							{
								"label": "Innledning",
								"text": "Kjærligheten utholder alt, tror alt,\nhåper alt, tåler alt.\nKjærligheten tar aldri slutt.\nProfetgavene skal bli borte,\ntungene skal tie\nog kunnskapen forgå.\nFor vi forstår stykkevis og taler profetisk stykkevis.\nMen når det fullkomne kommer,\nskal det som er stykkevis, ta slutt.\nDa jeg var barn, talte jeg som et barn,\ntenkte jeg som et barn, forsto jeg som et barn.\nMen da jeg ble voksen, la jeg av det barnslige.\nNå ser vi i et speil, i en gåte,\nda skal vi se ansikt til ansikt.\nNå forstår jeg stykkevis,\nda skal jeg erkjenne fullt ut,\nslik Gud kjenner meg fullt ut.\nSå blir de stående, disse tre: tro, håp og kjærlighet.\nMen størst blant dem er kjærligheten.\nSlik lyder Herrens ord.\n1 kor 13,7–13"
							},
							{
								"label": "Innledning",
								"text": "{{r}}ML |{{/r}} Det står skrevet i Paulus’ første brev til korinterne:"
							}
						],
						"avslutningAlts": [
							{
								"label": "Avslutning",
								"text": "{{r}}ML |{{/r}} Slik lyder Herrens ord."
							}
						],
						"selIntro": 0,
						"selAvsl": 0,
						"instr": "1 Kor 13,7-13 (eksempel)",
						"alts": [],
						"optional": true,
						"selAlt": 0,
						"text": ""
					},
					{
						"id": "l-29",
						"type": "tekst",
						"heading": "Halleluja",
						"text": "{{r}}L |{{/r}} La oss høre det hellige evangelium\n{{r}}M |{{/r}} Halleluja, Halleluja, Halleluja, Halleluja",
						"instr": "",
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-30",
						"type": "lesning",
						"heading": "Evangelium",
						"introAlts": [
							{
								"label": "Innledning",
								"text": "Som Far har elsket meg, har jeg elsket dere. Bli i min kjærlighet! Hvis dere holder mine bud, blir dere i min kjærlighet, slik jeg har holdt min Fars bud og blir i hans kjærlighet. Dette har jeg sagt dere for at min glede kan være i dere og deres glede kan bli fullkommen. Og dette er mitt bud: Dere skal elske hverandre som jeg har elsket dere.\nSlik lyder det hellige evangelium.\njoh 15,9–12"
							},
							{
								"label": "Innledning",
								"text": "{{r}}ML |{{/r}} Det står skrevet i evangeliet etter Johannes:"
							}
						],
						"avslutningAlts": [
							{
								"label": "Avslutning",
								"text": "{{r}}ML |{{/r}} Slik lyder Herrens ord."
							}
						],
						"selIntro": 0,
						"selAvsl": 0,
						"instr": "Joh 15,9-12 (eksempel)",
						"alts": [],
						"optional": false,
						"selAlt": 0,
						"text": ""
					},
					{
						"id": "l-31",
						"type": "tekst",
						"heading": "Respons",
						"text": "{{r}}M |{{/r}} Halleluja, Halleluja, Halleluja, Halleluja",
						"instr": "",
						"alts": [],
						"optional": true,
						"selAlt": 0
					},
					{
						"id": "l-32",
						"type": "tekst",
						"heading": "Tale",
						"text": "",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": true,
						"avslutningAlts": [
							{
								"label": "Lovprisning (full form)",
								"text": "{{r}}L |{{/r}} Ære være Faderen og Sønnen og Den hellige ånd,\nsom var og er og blir én sann Gud fra evighet og til evighet."
							},
							{
								"label": "Lovprisning (kort form)",
								"text": "{{r}}L |{{/r}} Ære være Faderen og Sønnen og Den hellige ånd: Vår skaper, frigjører og livgiver."
							}
						],
						"selAlt": 0,
						"selAvsl": 0
					},
					{
						"id": "l-33",
						"type": "tekst",
						"heading": "Trosbekjennelse Credo",
						"text": "",
						"instr": "",
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}ML/L |{{/r}} La oss bekjenne vår hellige tro"
							}
						],
						"selIntro": 0,
						"alts": [
							{
								"bibDup": true,
								"label": "Den apostoliske trosbekjennelse",
								"text": "{{r}}A |{{/r}} Jeg tror på Gud Fader, den allmektige, himmelens og jordens skaper.\nJeg tror på Jesus Kristus,\nGuds enbårne Sønn, vår Herre,\nsom ble unnfanget ved Den hellige ånd, født av jomfru Maria,\npint under Pontius Pilatus, korsfestet, død og begravet, fór ned til dødsriket,\nstod opp fra de døde tredje dag, fór opp til himmelen,\nsitter ved Guds, den allmektige Faders høyre hånd, skal derfra komme igjen\nfor å dømme levende og døde.\nJeg tror på Den hellige ånd, en hellig, allmenn kirke, de helliges samfunn, syndenes forlatelse, legemets oppstandelse\nog det evige liv.\nAmen."
							},
							{
								"bibDup": true,
								"label": "Den nikenske trosbekjennelse",
								"text": "{{r}}A |{{/r}} Vi tror på én Gud, den allmektige Far,\nsom har skapt himmel og jord, alt synlig og usynlig.\nVi tror på én Herre, Jesus Kristus, Guds enbårne Sønn,\nfødt av Faderen før alle tider, Gud av Gud, lys av lys,\nsann Gud av sann Gud, født, ikke skapt,\nav samme vesen som Faderen. Ved ham er alt blitt skapt.\nFor oss mennesker og til vår frelse steg han ned fra himmelen,\nog ved Den hellige ånd og av jomfru Maria ble han menneske av kjøtt og blod.\nHan ble korsfestet for oss under Pontius Pilatus, led og ble begravet,\noppstod den tredje dag etter Skriftene og fór opp til himmelen,\nsitter ved Faderens høyre hånd, skal komme igjen i herlighet for å dømme levende og døde, og hans rike skal være uten ende.\nVi tror på Den hellige ånd, som er Herre og gjør levende,\nsom utgår fra Faderen og Sønnen,\ntilbes og æres sammen med Faderen og Sønnen, og som har talt gjennom profetene.\nVi tror på én hellig, allmenn og apostolisk kirke.\nVi bekjenner én dåp til syndenes forlatelse og venter de dødes oppstandelse\nog et liv i den kommende verden. Amen."
							}
						],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-34",
						"type": "salme",
						"heading": "Salme etter talen",
						"text": "",
						"instr": "",
						"alts": [],
						"optional": true,
						"salmeNr": "",
						"salmeTittel": ""
					},
					{
						"id": "l-35",
						"type": "tekst",
						"heading": "Kunngjøringer",
						"text": "",
						"instr": "",
						"alts": [],
						"optional": true,
						"enabled": false,
						"selAlt": 0
					},
					{
						"id": "l-36",
						"type": "tekst",
						"heading": "Forbønn for kirken og verden",
						"text": "",
						"instr": "",
						"alts": [
							{
								"label": "Bakke og Gyland",
								"text": "{{r}}ML/L |{{/r}} Vår Far i himmelen.\nTakk for at du skapte oss, og jorden vi bor på.\nTakk for at du kjenner og elsker oss alle.\nHjelp oss til å ta vare på hverandre\nog på alt det du har skapt.\nGud, vi ber.\n{{r}}M |{{/r}} Menighetssvar\n{{r}}ML/L |{{/r}} Kjære Jesus.\nDu kom til jorden og ble menneske som oss.\nDu fant venner du kunne glede deg sammen med\nog gråte hos.\nTakk for evnen vår til vennskap.\nLa alle mennesker finne noen de kan stole på.\nDu har vist oss at hvert eneste menneske\ner viktig og verdifullt.\nVær hos alle som lider.\nLær oss å kjempe mot undertrykkelse og urett.\nGud, vi ber.\n{{r}}M |{{/r}} Menighetssvar\n{{r}}ML/L |{{/r}} Gode hellige Ånd.\nDu har kalt oss til å være din kirke.\nKom til oss med dine gaver,\nså vi kan være lys og salt i verden.\nVis oss veien vi skal gå,\nog gi oss vilje og kraft til å gå den.\nGud, vi ber.\n{{r}}M |{{/r}} Menighetssvar\n{{r}}ML/L |{{/r}} Bønnelapp på alteret...\nGud, vi ber.\n{{r}}M |{{/r}} Menighetssvar"
							},
							{
								"label": "Menighetssvar: Herre, hør vår bønn.",
								"text": "{{r}}M |{{/r}} Herre, hør vår bønn."
							},
							{
								"label": "Menighetssvar: Hør vår bønn. La ditt rike komme …",
								"text": "{{r}}M |{{/r}} Hør vår bønn. Hør vår bønn. La ditt rike komme, la din vilje skje, Gud! Hør vår bønn."
							},
							{
								"label": "Menighetssvar: Herre, hør vår bønn. (sunget serie 3)",
								"text": "{{r}}M |{{/r}} Herre, hør vår bønn."
							},
							{
								"label": "Menighetssvar: Herre, vår Gud, hør oss når vi ber.",
								"text": "{{r}}M |{{/r}} Herre, vår Gud, hør oss når vi ber."
							}
						],
						"optional": false,
						"selAlt": 0,
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}ML/L |{{/r}} La oss be for kirken og verden."
							}
						],
						"selIntro": 0
					},
					{
						"id": "l-37",
						"type": "tekst",
						"heading": "Menighetssvar",
						"text": "{{r}}M |{{/r}} Herre, hør vår bønn.\nEtter siste forbønn\n{{r}}M |{{/r}} Herre, hør vår bønn.\nAmen.",
						"instr": "",
						"alts": [],
						"optional": true,
						"selAlt": 0
					},
					{
						"id": "l-38",
						"type": "tekst",
						"heading": "Fadervår",
						"text": "{{r}}A |{{/r}} Vår Far i himmelen.\nLa navnet ditt helliges.\nLa riket ditt komme.\nLa viljen din skje på jorden slik som i himmelen.\nGi oss i dag vårt daglige brød,\nog tilgi oss vår skyld,\nslik også vi tilgir våre skyldnere.\nOg la oss ikke komme i fristelse,\nmen frels oss fra det onde.\nFor riket er ditt,\nog makten og æren i evighet.\nAmen.",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-39",
						"type": "tekst",
						"heading": "Takkoffer",
						"text": "{{r}}L |{{/r}} Vi skal samle inn takkeofferet, det går i dag til ...\nTakkeoffer, det spilles instrumentalmusikk underveis\n{{r}}L |{{/r}} Evige Gud, din er jorden og det som fyller den.\nAlt vi eier tilhører deg. Av ditt eget gir vi deg tilbake.\nA / L  Ta imot oss og våre gaver i Jesu navn. Amen.",
						"instr": "",
						"alts": [],
						"optional": true,
						"enabled": false,
						"selAlt": 0
					},
					{
						"id": "l-40",
						"type": "instruks",
						"heading": "Takkeofferet i dag",
						"text": "{{r}}A/L |{{/r}} I dag går takkeofferet til ...\nVippsnummer: 62 89 89  (Gyland)\nVippsnummer: 60 66 45  (Bakke)",
						"instr": "",
						"alts": [],
						"optional": true,
						"enabled": false,
						"selAlt": 0
					}
				]
			},
			{
				"title": "III. Nattverd",
				"items": [
					{
						"id": "l-41",
						"type": "salme",
						"heading": "Nattverdsalme",
						"text": "",
						"instr": "Bordet dekkes. Brød og vin settes fram.",
						"alts": [],
						"optional": false,
						"salmeNr": "",
						"salmeTittel": "",
						"enabled": false
					},
					{
						"id": "l-42",
						"type": "tekst",
						"heading": "Hilsen prefasjonsdialog",
						"text": "{{r}}L |{{/r}} Herren være med dere.\nM  reiser seg og synger Og med deg være Herren.\n{{r}}L |{{/r}} Løft deres hjerter.\n{{r}}M |{{/r}} Vi løfter våre hjerter til Herren.\n{{r}}L |{{/r}} La oss takke Herren vår Gud.\n{{r}}M |{{/r}} Det er verdig og rett.",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-43",
						"type": "tekst",
						"heading": "Innledende lovprisning prefasjon",
						"text": "",
						"instr": "",
						"alts": [
							{
								"bibDup": true,
								"label": "Bakke og Gyland",
								"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som du sendte til frelse for verden, for at vi ved hans død skulle få tilgivelse for syndene og ved hans oppstandelse vinne det evige liv. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
							},
							{
								"label": "Nattverdbønn a (omarbeidet fra høymessen 1977)",
								"text": "PREFASJON | I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som du sendte til frelse for verden, for at vi ved hans død skulle få tilgivelse for syndene og ved hans oppstandelse vinne det evige liv. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:\nSANCTUS\nEPIKLESE | Vi priser deg, hellige Gud, himmelens og jordens Skaper, du som har elsket verden og gitt din Sønn, Jesus Kristus, for at han skulle frelse oss fra synd og død og vinne deg et hellig folk.\n{{r}}L |{{/r}} Vi ber deg: Send din Ånd over disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen.\nVERBA | Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\nTROENS MYSTERIUM\nAVSLUTNING | Nådige Gud, vi feirer dette måltidet med glede og takk for din Sønns fullbrakte offer, i troen på hans seierrike oppstandelse og himmelfart og i forventning om hans gjenkomst i herlighet. Vi ber deg: Fyll oss med din Ånd og kjærlighet, så vi kan gjenkjenne Kristus i den som sulter og tørster. Lær oss å elske hverandre som han har elsket oss, og la oss en gang samles hos deg i ditt fullendte rike."
							},
							{
								"label": "Nattverdbønn b (etter Hippolyt, 200-tallet)",
								"text": "PREFASJON | Vi takker deg, Gud, ved din elskede Sønn Jesus Kristus. Han er det evige Ord, og ved dette Ord skapte du alt. Da tiden var inne, sendte du ham til verden som frelser og befrier. For dette priser vi deg, sammen med alle dine hellige i himmelen og på jorden:\nSANCTUS\nEPIKLESE | Vi priser deg Gud for Jesus Kristus, din tjener. Han kom fra himmelen, og ved Den hellige ånd og jomfru Maria ble han menneske av kjøtt og blod. Han oppfylte din vilje da han strakte ut sine hender på korsets tre. Slik tilintetgjorde han døden, brøt ondskapens lenker og åpenbarte oppstandelsen fra de døde. Derfor minnes vi hans død og oppstandelse når vi bærer brødet og vinen fram for deg.\n{{r}}L |{{/r}} Vi ber deg: Send din hellige Ånd over disse gaver, så de for oss blir livets brød og frelsens beger.\nVERBA | Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\nTROENS MYSTERIUM\nAVSLUTNING | La alle som får del i brødet og vinen, forenes til ett. Fyll oss med din hellige Ånd og grunnfest oss i sannheten, så vi kan prise deg i din hellige kirke nå og i all evighet."
							},
							{
								"label": "Nattverdbønn c (paulinske tekster)",
								"text": "PREFASJON | Å, dyp av rikdom og visdom og kunnskap hos deg, Gud! Himlene forteller om din herlighet, og jorden vitner om dine henders verk. Sammen med de troende gjennom alle tider vil vi prise ditt hellige navn:\nSANCTUS\nEPIKLESE | Hellig og barmhjertig er du, Gud, som ikke vendte deg bort da mennesket syndet, men gav løfte til Abraham om velsignelse for alle folkeslag. Mektig og trofast er du, som befridde ditt folk fra trelldom, og fornyet løftene gjennom profetene.\nDa tiden var inne, sendte du din Sønn, født av Maria, for å kjøpe oss fri og gi oss retten til å være dine barn.\nVed hans død på korset forsonte du alt med deg selv og skapte fred, og ved hans oppstandelse ble døden overvunnet.\n{{r}}L |{{/r}} Vi ber deg: Send din Ånd over disse dine gaver. Foren oss i troen på din nåde, så vi kan ta imot Jesu legeme og blod til forsoning og fred, og forkynne hans død til han kommer.\nVERBA | Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\nTROENS MYSTERIUM\nAVSLUTNING | Evige Gud, forny oss ved din Ånd. Sammen med alt som er skapt, venter vi med lengsel på å bli frigjort fra forgjengelighet og få del i den frihet som dine barn skal eie i herligheten. Fra deg og ved deg og til deg er alle ting. Deg være ære i all evighet!"
							},
							{
								"label": "Nattverdbønn d (Emmausfortellingen, Luk 24)",
								"text": "PREFASJON | Vi priser deg, evige Gud, du som har skapt verden og alt som er i den. Det er i deg vi lever, beveger oss og er til. Sammen med din menighet i himmelen og på jorden lovsynger vi ditt hellige navn:\nSANCTUS\nEPIKLESE | Vi takker deg, all godhets kilde. Du sendte din Sønn. Han ble korsfestet og stod opp fra de døde. Han åpnet skriftene og åpenbarte seg for sine venner da han brøt brødet og gav dem.\n{{r}}L |{{/r}} Nå ber vi deg: La din hellige Ånd komme over brødet og vinen, så våre øyne åpnes, og vi kjenner ham igjen som vår korsfestede og oppstandne Frelser.\nVERBA | Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\nTROENS MYSTERIUM\nAVSLUTNING | Hellige Gud, fyll oss med din Ånd. Gi oss brennende hjerter, så vi i undring og glede tar vare på ditt ord og viser barmhjertighet mot den som lider. Bli hos oss, også når vi tviler og sørger. Gå med oss, inntil savn og smerte har veket for evig jubel og lovsang."
							},
							{
								"label": "Nattverdbønn e (bearbeidet etter familiemessen 2003)",
								"text": "PREFASJON | Vi takker deg, gode Gud, du som holder himmel og jord i dine hender. Du har skapt oss i ditt bilde og gitt oss livet i gave. Sammen med englene og din menighet i himmelen og på jorden lovsynger vi ditt hellige navn:\nSANCTUS\nEPIKLESE | Hellige Gud, vi takker deg for Jesus Kristus, verdens frelser. Han døde og stod opp igjen for å gi oss evig liv. Vi takker deg for dåpens gave, der vi blir født på ny, og for nattverden, der du samler oss som din store familie.\n{{r}}L |{{/r}} Vi ber deg: Send din hellige Ånd over brødet og vinen. Gjør oss til ett med hverandre og med Jesus Kristus.\nVERBA | Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\nTROENS MYSTERIUM\nAVSLUTNING | Gud, fyll oss med din Ånd. Ta oss alle i favn, slik en kjærlig mor samler barna sine om seg. La de små bli opphøyet og de sultne bli mettet med gode gaver.\nLiturgen og/eller ett eller flere barn synger eller sier: Sammen med alle dine barn ber vi den bønn som din Sønn har lært oss:"
							},
							{
								"label": "Nattverdbønn f (kort – ved særskilte anledninger)",
								"text": "PREFASJON | Gode Gud, du har skapt oss og kalt oss ved navn. Du åpner din hånd og metter alt som lever med det gode. Sammen med din menighet i himmelen og på jorden lovsynger vi ditt hellige navn:\nSANCTUS\nEPIKLESE | Vi takker deg for Jesus Kristus, vår frelser. Han er det levende brød som kommer ned fra himmelen og gir verden liv.\n{{r}}L |{{/r}} Vi ber deg: Send din Ånd over oss og disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen.\nVERBA | Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\nTROENS MYSTERIUM\nAVSLUTNING | Sammen med alle dine barn ber vi den bønn som din Sønn har lært oss:"
							},
							{
								"label": "Nattverdbønn g (Gudstjenesteboken 1992, Johannesordningen)",
								"text": "PREFASJON | Evige, allmektige Gud, du holder himmel og jord i dine hender, du nevner oss alle ved navn, så vi skal tilhøre deg og være ditt folk på jorden. Sammen med de troende gjennom alle tider og med de himmelske hærskarer vil vi prise ditt hellige navn:\nSANCTUS\nEPIKLESE | Hellige Gud, uten ende er din miskunn, og evig er ditt herredømme. Du har fylt ditt skaperverk med lys og liv; himmelen og jorden er fulle av din herlighet. Gjennom Abraham lovte du å velsigne alle folkeslag. Du berget Israel, ditt utvalgte folk. Gjennom profetene fornyet du ditt løfte. Og da tiden var kommet, sendte du din Sønn, han som i ord og gjerning forkynte ditt rike og var lydig mot din vilje helt til døden.\n{{r}}L |{{/r}} Vi ber deg: Send din Ånd over disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen.\nVERBA | Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\n{{r}}L/ML |{{/r}} Derfor, så ofte som vi spiser dette brødet og drikker av begeret, forkynner vi Herrens død, inntil han kommer.\nTROENS MYSTERIUM\nAVSLUTNING | Derfor, barmhjertige Far, vil vi med dette brødet og dette begeret komme i hu at Herren gav sitt liv for oss. Og i troen på hans oppstandelse venter vi på at han kommer igjen i makt og herlighet og vil holde sitt store gjestebud sammen med sitt folk.\n{{r}}A |{{/r}} Amen, ja, kom, Herre Jesus.\n{{r}}L |{{/r}} Vi ber deg, allmektige Gud, gi oss din hellige Ånd. La oss kjenne kraften av Kristi oppstandelse, så vi som tar imot hans legeme og blod, kan leve til pris og ære for din herlighet og få del i den arven som de hellige får i lyset.\n{{r}}A |{{/r}} Amen, ja, kom, du Hellige Ånd.\n{{r}}L/ML |{{/r}} Foren vår bønn med bønnene fra dine tjenere alle steder og gjennom alle tider, og med forbønnen fra vår store øversteprest, som alltid ber for oss, inntil han kommer med seier, som Herren over alle ting. Ved ham og i ham og i samfunn med Den hellige ånd skal du ha all herlighet og ære, allmektige Far, evige Gud, nå og til evig tid."
							}
						],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-44",
						"type": "tekst",
						"heading": "Hellig sanctus",
						"text": "A  synger Hellig, hellig, hellig er Herren Sebaot.\nAll jorden er full av din herlighet. Hosianna i det høyeste.\nVelsignet være han som kommer i Herrens navn. Hosianna i det høyeste.",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-45",
						"type": "tekst",
						"heading": "Påkallelse epiklese",
						"text": "{{r}}L |{{/r}} Vi priser deg, hellige Gud, himmelens og jordens Skaper, du som har elsket verden og gitt din Sønn, Jesus Kristus,\nfor at han skulle frelse oss fra synd og død og vinne deg et hellig folk. Vi ber deg: Send din Ånd over disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen.",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-46",
						"type": "tekst",
						"heading": "Innstiftelsesordene verba",
						"text": "{{r}}L |{{/r}} Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-47",
						"type": "tekst",
						"heading": "Troens mysterium",
						"text": "{{r}}L |{{/r}} Stort er troens mysterium.\n{{r}}A |{{/r}} Kristus døde. Kristus stod opp. Kristus skal komme igjen.\n{{r}}A |{{/r}} Ham være ære for kjærligheten som er sterkere enn døden.",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-48",
						"type": "tekst",
						"heading": "Nattverdbønn",
						"text": "{{r}}L |{{/r}} Nådige Gud, vi feirer dette måltid med glede og takk for din Sønns fullbrakte offer, i troen på hans seierrike oppstandelse og himmelfart og i forventning om hans gjenkomst i herlighet.\nVi ber deg: Fyll oss med din Ånd og kjærlighet, så vi kan gjenkjenne Kristus i den som sulter og tørster. Lær oss å elske hverandre som han har elsket oss, og la oss en gang samles hos deg i ditt fullendte rike.",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-49",
						"type": "tekst",
						"heading": "Fadervår (nattverden)",
						"text": "{{r}}A |{{/r}} Vår Far i himmelen.\nLa navnet ditt helliges.\nLa riket ditt komme.\nLa viljen din skje på jorden slik som i himmelen.\nGi oss i dag vårt daglige brød,\nog tilgi oss vår skyld,\nslik også vi tilgir våre skyldnere.\nOg la oss ikke komme i fristelse,\nmen frels oss fra det onde.\nFor riket er ditt,\nog makten og æren i evighet.\nAmen.",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-50",
						"type": "tekst",
						"heading": "Fredshilsen pax",
						"text": "{{r}}L |{{/r}} Guds fred være med dere.\n{{r}}M |{{/r}} Guds fred være med deg.",
						"instr": "",
						"bibDup": true,
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-51",
						"type": "tekst",
						"heading": "Du Guds Lam agnus dei",
						"text": "",
						"instr": "",
						"alts": [
							{
								"bibDup": true,
								"label": "Bakke og Gyland",
								"text": "A  synger Du Guds Lam, som bærer verdens synder,\nmiskunne deg over oss.\nDu Guds Lam, som bærer verdens synder,\nmiskunne deg over oss.\nDu Guds Lam, som bærer verdens synder,\ngi oss din fred."
							},
							{
								"bibDup": true,
								"label": "Allmenn serie 1, 2, fest- og fasteserien",
								"text": "{{r}}A |{{/r}} Du Guds Lam, som bærer verdens synder, miskunne deg over oss.\nDu Guds Lam, som bærer verdens synder, miskunne deg over oss.\nDu Guds Lam, som bærer verdens synder, gi oss din fred."
							},
							{
								"bibDup": true,
								"label": "Allmenn serie 3",
								"text": "{{r}}ML |{{/r}} Amen, kom, Herre Jesus. A | Omkved: Amen, kom, Herre Jesus.\n{{r}}ML |{{/r}} Du er Lammet som bærer vår synd. A | Omkved\n{{r}}ML |{{/r}} Du er Lammet som gir oss din fred. A | Omkved\n{{r}}ML |{{/r}} Du er brødet som gir oss ditt liv. A | Omkved"
							}
						],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-52",
						"type": "tekst",
						"heading": "Utdeling",
						"text": "{{r}}L |{{/r}} Når vi nå skal feire nattverd sammen, (ta beger og kom til alterringen/få brød og dypp i begeret).\nKom for alt er gjort ferdig.\n{{r}}L |{{/r}} Kristi kropp, gitt for deg.\n{{r}}ML |{{/r}} Kristi blod, gitt for deg.",
						"instr": "",
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-53",
						"type": "tekst",
						"heading": "Fredsønske",
						"text": "{{r}}L |{{/r}} Den korsfestede og oppstandne Jesus Kristus har nå gitt oss sin kropp og sitt blod som han gav til soning for alle våre synder.\nHan styrke oss og holde oss oppe i en sann tro til det evige liv.\n{{r}}L |{{/r}} Fred være med dere.",
						"instr": "",
						"alts": [],
						"optional": true,
						"selAlt": 0
					},
					{
						"id": "l-54",
						"type": "tekst",
						"heading": "Måltidets avslutning",
						"text": "",
						"instr": "",
						"introAlts": [
							{
								"label": "Innledning",
								"text": "{{r}}L/ML |{{/r}} La oss takke og be"
							}
						],
						"selIntro": 0,
						"alts": [
							{
								"bibDup": true,
								"label": "Bakke og Gyland",
								"text": "Vi takker deg, himmelske Far, for dine velsignede gaver.\nVi ber deg at du ved disse gavene vil bevare oss i troen på deg, forene oss i din kjærlighet og stadfeste i oss håpet om det evige liv, for Jesu Kristi skyld.\nAmen"
							},
							{
								"bibDup": true,
								"label": "Takkebønn 1 (kan synges)",
								"text": "{{r}}L/ML |{{/r}} Vi takker deg, himmelske Far, for dine velsignede gaver.\nVi ber deg at du ved disse gavene vil bevare oss i troen på deg, forene oss i din kjærlighet og stadfeste i oss håpet om det evige liv, for Jesu Kristi skyld.\n{{r}}M |{{/r}} Amen."
							},
							{
								"bibDup": true,
								"label": "Takkebønn 2",
								"text": "{{r}}L/ML |{{/r}} Vi takker deg, visdommens Gud, for ditt måltids dype hemmelighet: Brødet vi har brutt, er ett. Din Sønn har gitt sitt liv for én verden og én menneskehet. Vi ber:\nA/L/ML | Hjelp oss å høre det ropet du har hørt, å se den nøden du har sett, og å elske vår neste som oss selv."
							},
							{
								"bibDup": true,
								"label": "Takkebønn 3",
								"text": "{{r}}L/ML |{{/r}} Vi takker deg, nådige Gud, du som gjennom brødet og vinen har gitt oss del i Jesu Kristi seierrike død og oppstandelse. Vi ber:\nA/L/ML | Styrk oss ved din Ånd til vitnesbyrd og tjeneste i verden."
							},
							{
								"bibDup": true,
								"label": "Takkebønn 4",
								"text": "{{r}}L/ML |{{/r}} Trofaste Gud, du som i dåpen har gitt oss barnekår og gjort oss til arvinger i ditt rike. Vi takker deg for dette måltidet, hvor du har gitt oss syndenes forlatelse og fornyet i oss troen på dine løfter. Vi ber:\nA/L/ML | Styrk oss ved din Ånd til vitnesbyrd og tjeneste i verden."
							}
						],
						"optional": false,
						"selAlt": 0
					}
				]
			},
			{
				"title": "IV. Sendelse",
				"items": [
					{
						"id": "l-55",
						"type": "tekst",
						"heading": "Bønn for Bønnekrukke",
						"text": "Prest\nHimmelske Far. Vi kommer fram for deg med våre bønner.\nDu ser hva som ligger oss på hjerte.\nVi ber deg: Kom oss til hjelp,\nstøtt oss i hverdagen,\nhør våre bønner,\nfor Jesu Kristi skyld.\nAmen.",
						"instr": "",
						"alts": [],
						"optional": true,
						"selAlt": 0
					},
					{
						"id": "l-56",
						"type": "salme",
						"heading": "Sendelsessalme",
						"text": "",
						"instr": "",
						"alts": [],
						"optional": false,
						"salmeNr": "",
						"salmeTittel": ""
					},
					{
						"id": "l-57",
						"type": "tekst",
						"heading": "Lovprisning",
						"text": "{{r}}L |{{/r}} La oss prise Herren.\n{{r}}M |{{/r}} Gud være lovet. Halleluja. Halleluja. Halleluja.",
						"instr": "",
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-58",
						"type": "tekst",
						"heading": "Velsignelse",
						"text": "",
						"instr": "3x3 Bønneslag ved hver velsignelse.",
						"alts": [],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-59",
						"type": "tekst",
						"heading": "Utsendelse",
						"text": "",
						"instr": "",
						"alts": [
							{
								"bibDup": true,
								"label": "Bakke og Gyland",
								"text": "L / LM  Gå i fred. Tjen Herren med glede."
							},
							{
								"bibDup": true,
								"label": "La oss gå i fred",
								"text": "{{r}}L/ML |{{/r}} La oss gå i fred,\n{{r}}A |{{/r}} i Jesu Kristi navn."
							},
							{
								"bibDup": true,
								"label": "Gå i fred. Tjen Herren med glede.",
								"text": "{{r}}L/ML |{{/r}} Gå i fred. Tjen Herren med glede."
							}
						],
						"optional": false,
						"selAlt": 0
					},
					{
						"id": "l-60",
						"type": "salme",
						"heading": "Postludium/Utgangsprosesjon",
						"text": "",
						"instr": "",
						"alts": [],
						"optional": false,
						"salmeNr": "",
						"salmeTittel": ""
					}
				]
			}
		],
		"malForm": "bokmål"
	},
	{
		kategori: "Dåp og konfirmasjon",
		filnavn: "Dåp i hovedgudstjenesten (2017) (nynorsk)",
		erOriginal: true,

		"id": "dåp-i-hovedgudstjenesten-2017-nynorsk",
		"kategori": "Dåp og konfirmasjon",
		"oversettelser": [
		"dop-i-hovedgudstjenesten-2017"
		],
		"name": "Dåp i hovedgudstjenesten (2017)",
		"description": "Grunnordningen for dåp i hovedgudstjenesten i bokmål, vedtatt av Kirkemøtet 2017.",
		"kanGudstjeneste": false,
		"sections": [
		{
			"title": "Dåp i hovedgudstjenesten",
			"items": [
				{
					"id": "dap-nn-dåp",
					"type": "tekst",
					"heading": "DÅP",
					"instr": "Dåp i hovedgudstjenesten skjer normalt her (ettersatt foran Dagens bønn i ordningen). Ordningen er vedteke av Kyrkjemøtet 2017.",
					"text": "",
					"alts": [],
					"introAlts": [],
					"avslutningAlts": [],
					"selAlt": 0,
					"selIntro": 0,
					"selAvsl": 0,
					"enabled": true,
					"optional": null,
					"salmeNr": "",
					"salmeTittel": ""
				},
				{
					"id": "dap-nn-1-mottaking-til-dåp",
					"type": "tekst",
					"heading": "1 Mottaking til dåp",
					"instr": "",
					"text": "",
					"alts": [
						{
							"label": "Ved dåp av born",
							"text": "{{r}}L |{{/r}} Med takk og glede kjem vi i dag med dette barnet/desse borna til Gud i den heilage dåpen. I dåpen tek Gud imot oss og sameinar oss med den krossfeste og oppstadne Jesus Kristus."
						},
						{
							"label": "Ved dåp av større born, unge eller vaksne",
							"text": "{{r}}L |{{/r}} Med takk og glede kjem vi i dag med NN/dere til Gud i den heilage dåpen. I dåpen tak Gud imot oss og sameinar oss med den korsfestede og oppstandne Jesus Kristus."
						}
					],
					"introAlts": [
						{
							"label": "Mottaking",
							"text": "{{r}}L |{{/r}} I namnet åt Faderen og Sonen og Den heilage ande."
						},
						{
							"label": "Eller",
							"text": "{{r}}L |{{/r}} I namnet åt Faderen og Sonen og Den heilage ande: Vår skapar, frigjerar og livgjevar."
						}
					],
					"avslutningAlts": [],
					"selAlt": 0,
					"selIntro": 0,
					"selAvsl": 0,
					"enabled": true,
					"optional": true,
					"salmeNr": "",
					"salmeTittel": ""
				},
				{
					"id": "dap-nn-bibelord",
					"type": "tekst",
					"heading": "Bibelord",
					"instr": "Ved dåp av større born, unge eller vaksne kan eventuelt ein av desse tekstane koma i staden for Markus-teksten.",
					"text": "",
					"alts": [
						{
							"label": "Mark 10,13–16",
							"text": "{{r}}L |{{/r}} Høyr kor venleg Jesus tek imot borna og opnar Gudsrike for dei:\n@NOTAT Ein i dåpsfølgjet, ein annan medliturg eller liturgen les teksten:\n{{r}}ML/L |{{/r}} Dei bar små born til Jesus for at han skulle røra ved dei, men læresveinane viste dei bort. Då Jesus såg det, vart han sint og sa til dei: «Lat småborna koma til meg og hindra dei ikkje! For Guds rike høyrer slike til. Sanneleg, eg seier dykk: Den som ikkje tek imot Guds rike slik som eit lite barn, skal ikkje koma inn i det.» Så tok han dei inn til seg, la hendene på dei og velsigna dei.\nBIBELREF | Mark 10,13–16"
						},
						{
							"label": "Tit 3,4–7",
							"text": "{{r}}L |{{/r}} Høyr kva apostelen Paulus seier om dåpen:\nBIBELREF | Tit 3,4–7"
						},
						{
							"label": "Joh 3,1–5",
							"text": "{{r}}L |{{/r}} Jesus seier at vi blir fødde på nytt i dåpen:\n{{r}}ML/L |{{/r}} Det var ein mann som heitte Nikodemus. Han var farisear og sat i Rådet til jødane. Han kom til Jesus om natta og sa: «Rabbi, vi veit at du er ein lærar som er komen frå Gud, for ingen kan gjera dei teikna du gjer, utan at Gud er med han.» Jesus svara og sa til han: «Sanneleg, sanneleg, eg seier deg: Den som ikkje blir fødd på nytt, kan ikkje sjå Guds rike.» Nikodemus seier til han: «Korleis kan ein som er gammal, bli fødd? Ein kan vel ikkje koma inn i morslivet igjen og bli fødd andre gongen?» Jesus svara: «Sanneleg, sanneleg, eg seier deg: Den som ikkje blir fødd av vatn og Ande, kan ikkje koma inn i Guds rike.»\nBIBELREF | Joh 3,1–5"
						},
						{
							"label": "Rom 6,3–8",
							"text": "{{r}}L |{{/r}} Høyr kva apostelen Paulus seier om dåpen:\n{{r}}ML/L |{{/r}} Veit de ikkje at alle vi som vart døypte til Kristus Jesus, vart døypte til døden hans? Vi vart gravlagde med han då vi vart døypte med denne dåpen til døden. Og slik Kristus vart oppreist frå dei døde ved sin Fars herlegdom, skal vi òg vandra i eit nytt liv. Har vi vakse saman med Kristus i ein død som er lik hans, skal vi òg vera eitt med han i ei oppstode som er lik hans. Vi veit at vårt gamle menneske vart krossfest med han, for at den kroppen som er underlagd synda, skulle gjerast til inkjes og vi ikkje lenger skulle vera slavar under synda. For synda har ikkje lenger nokon rett over den som er død. Men er vi døde med Kristus, trur vi at vi òg skal leva med han.\nBIBELREF | Rom 6,3–8"
						}
					],
					"introAlts": [
						{
							"label": "Skriftord",
							"text": "@NOTAT Her kan ein lesa følgjande skriftord:\n{{r}}L |{{/r}} For så elska Gud verda at han gav Son sin, den einborne, så kvar den som trur på han, ikkje skal gå tapt, men ha evig liv.\nBIBELREF | Joh 3,16"
						}
					],
					"avslutningAlts": [],
					"selAlt": 0,
					"selIntro": 0,
					"selAvsl": 0,
					"enabled": true,
					"optional": true,
					"salmeNr": "",
					"salmeTittel": ""
				},
				{
					"id": "dap-nn-takkebønn",
					"type": "tekst",
					"heading": "Takkebønn",
					"instr": "Her, eller før den avsluttande lovprisninga (1 Pet 1,3), kan liturgen kort seie noko om den aktuelle dåpshandlinga.",
					"text": "{{r}}L |{{/r}} Lat oss takka og be:\n{{r}}L/ML |{{/r}} Evige Gud, du som gjev liv til alt som lever, og har skapt oss i ditt bilete: Vi takkar deg for NN/NN (fornamn) som i dag skal bli døypt/døypte. Ho/Han/Dei er dyrebar(e) i dine auge. Ver hos henne/han/dei med din kjærleik og gje henne/han/dei ein heim i di kyrkje.\nAmen.",
					"alts": [],
					"introAlts": [],
					"avslutningAlts": [],
					"selAlt": 0,
					"selIntro": 0,
					"selAvsl": 0,
					"enabled": true,
					"optional": true,
					"salmeNr": "",
					"salmeTittel": ""
				},
				{
					"id": "dap-nn-2-dåpssalme",
					"type": "tekst",
					"heading": "2 Dåpssalme",
					"instr": "Ein dåpssalme kjem anten her, før 1 Mottaking til dåp, før 4 Fadderansvaret eller som avslutning av dåpshandlinga.",
					"text": "",
					"alts": [],
					"introAlts": [],
					"avslutningAlts": [],
					"selAlt": 0,
					"selIntro": 0,
					"selAvsl": 0,
					"enabled": true,
					"optional": true,
					"salmeNr": "",
					"salmeTittel": ""
				},
				{
					"id": "dap-nn-3-dåpsbefalinga",
					"type": "tekst",
					"heading": "3 Dåpsbefalinga",
					"instr": "Ein i dåpsfølgjet, ein annan medliturg eller liturgen les teksten:",
					"text": "{{r}}L |{{/r}} Lat oss høyra Jesu ord og bod om den heilage dåpen:\n{{r}}ML/L |{{/r}} Eg har fått all makt i himmelen og på jorda. Gå difor og gjer alle folkeslag til læresveinar: Døyp dei til namnet åt Faderen og Sonen og Den heilage ande og lær dei å halda alt det som eg har bode dykk. Og sjå, eg er med dykk alle dagar så lenge verda står.\nBIBELREF | Matt 28, 18–20",
					"alts": [],
					"introAlts": [],
					"avslutningAlts": [],
					"selAlt": 0,
					"selIntro": 0,
					"selAvsl": 0,
					"enabled": true,
					"optional": true,
					"salmeNr": "",
					"salmeTittel": ""
				},
				{
					"id": "dap-nn-4-fadderansvaret",
					"type": "tekst",
					"heading": "4 Fadderansvaret",
					"instr": "",
					"text": "",
					"alts": [
						{
							"label": "Ved dåp av born",
							"text": "{{r}}L |{{/r}} Vil foreldre og fadrar reisa seg.\nDe skal vera vitne om at dette barnet/desse borna er døypt/døypte med den kristne dåpen. Saman med kyrkjelyden vår og heile kyrkja får de del i eit heilagt ansvar: å visa omsorg for henne/han/dei, be for henne/han/dei, læra henne sjølv/han sjølv/dei sjølve å be og hjelpa henne/han/dei til å bruka Guds ord og delta i den heilage nattverden, så ho/han/dei kan leva og veksa i den kristne trua."
						},
						{
							"label": "Ved dåp av større born, unge eller vaksne",
							"text": "{{r}}L |{{/r}} Vil (foreldre og) fadrar reisa seg.\nDe skal vera vitne om at NN/desse er døypt/døypte med den kristne dåpen. Saman med kyrkjelyden vår og heile kyrkja får de del i eit heilagt ansvar: å visa omsorg for henne/han/dei, be for henne/han/dei og hjelpa henne/han/dei til å bruka Guds ord og delta i den heilage nattverden, så ho/han/dei kan leva og veksa i den kristne trua."
						}
					],
					"introAlts": [],
					"avslutningAlts": [],
					"selAlt": 0,
					"selIntro": 0,
					"selAvsl": 0,
					"enabled": true,
					"optional": true,
					"salmeNr": "",
					"salmeTittel": ""
				},
				{
					"id": "dap-nn-5-forsakinga-og-trua",
					"type": "tekst",
					"heading": "5 Forsakinga og trua",
					"instr": "Den apostoliske trusvedkjenninga.",
					"text": "{{r}}A |{{/r}} Eg forsakar djevelen og alle hans gjerningar og alt hans vesen. Eg trur på Gud Fader, den allmektige, som skapte himmel og jord.\nEg trur på Jesus Kristus, Guds einborne Son, vår Herre, som vart avla ved Den heilage ande, fødd av Maria møy, pint under Pontius Pilatus, vart krossfest, døydde og vart gravlagd, fór ned til dødsriket, stod opp frå dei døde tredje dagen, fór opp til himmelen, sit ved høgre handa åt Gud, den allmektige Fader, skal koma att derifrå og døma levande og døde.\nEg trur på Den heilage ande, ei heilag, allmenn kyrkje, eit samfunn av dei heilage, forlating for syndene, oppstoda av lekamen og evig liv.\nAmen.",
					"alts": [],
					"introAlts": [
						{
							"label": "Ved dåp av born",
							"text": "{{r}}L |{{/r}} Lat oss saman vedkjennast forsakinga og trua, som vi blir døypte til.\n@NOTAT Alle reiser seg."
						},
						{
							"label": "Ved dåp av større born, unge eller vaksne",
							"text": "{{r}}L |{{/r}} Vil du saman med denne kyrkjelyden vedkjennast forsakinga og trua som vi blir døypte til?\n{{r}}Dåpskandidaten |{{/r}} Ja.\n@NOTAT Dåpskandidaten kan om nødvendig her og ved dåpshandlinga gje stadfestande svar på andre måtar enn med verbalt språk. Dei som sjølve kan svara på spørsmålet, blir først spurde. Når alle har svara, seier liturgen:\n{{r}}L |{{/r}} Lat oss saman vedkjennast forsakinga og trua.\n@NOTAT Alle reiser seg."
						}
					],
					"avslutningAlts": [],
					"selAlt": 0,
					"selIntro": 0,
					"selAvsl": 0,
					"enabled": true,
					"optional": true,
					"salmeNr": "",
					"salmeTittel": ""
				},
				{
					"id": "dap-nn-6-dåpshandlingen",
					"type": "tekst",
					"heading": "6 Dåpshandlingen",
					"instr": "",
					"text": "",
					"alts": [
						{
							"label": "Ved dåp av born",
							"text": "{{r}}L |{{/r}} Kva heiter barnet?\n@NOTAT Den som ber barnet, seier fornamnet på barnet.\n{{r}}L |{{/r}} Vil de at NN skal døypast til namnet åt Faderen og Sonen og Den heilage ande og oppsedast til eit liv i den kristne forsakinga og trua?\n@NOTAT Den som ber barnet, foreldra/dei føresatte og fadrane, svarar:\nJa."
						},
						{
							"label": "Ved dåp av større born, unge eller vaksne",
							"text": "{{r}}L |{{/r}} Kva heiter du?\n(Den som skal døypast, svarer sjølv ved å seia fornamnet sitt. Om nødvendig\nkan ein annan seia namnet..)\n{{r}}L |{{/r}} NN, vil du bli døypt til namnet åt Faderen og Sonen og Den heilage ande og leva i den kristne forsakinga og trua?\n(Den som skal døypast, svarar:)\nJa."
						}
					],
					"introAlts": [
						{
							"label": "Bønn ved døypefonten",
							"text": "@NOTAT Ein heller vatnet i døypefonten.\n{{r}}L |{{/r}} Miskunnsame Gud, vi takkar deg for at dåpsvatnet ved ditt ord er ei nådekjelde, der du tilgjev oss vår synd, frelser oss frå dødens makt og gjev oss lovnad om det evige livet. Send din Ande, så ho/han/dei som blir døypt/døypte, blir reist/reiste opp til det nye livet med Jesus Kristus, vår Herre.\n@NOTAT Mellom kvar dåp kan ein syngja eit vers frå ein høveleg salme. Dåpsfølgjet går fram til døypefonten."
						}
					],
					"avslutningAlts": [
						{
							"label": "Korsets tegn, dåpen og velsigninga",
							"text": "@NOTAT Liturgen vender seg mot andletet til barnets/dåpskandidaten og bed bøna med open handflate.\n{{r}}L |{{/r}} Gud vare din utgang og din inngang frå no og til evig tid. Eg teiknar deg med det heilage krossmerket ✠ til vitnemål om at du skal høyra den krossfeste og oppstadne Jesus Kristus til og tru på han.\n{{r}}L |{{/r}} NN, etter vår Herre Jesu Kristi ord og bod døyper eg deg til namnet åt Faderen og Sonen og Den heilage ande.\n@NOTAT Medan dette blir sagt, auser liturgen med handa rikeleg med vatn over hovudet til den som blir døypt, tre gonger.\n@NOTAT Liturgen legg, gjerne saman med fadrane, handa på hovudet til den døypte og seier:\n{{r}}L |{{/r}} Den allmektige Gud har no gjeve deg sin heilage Ande, fødd deg på nytt og teke deg inn i sin truande kyrkjelyd. Gud styrkje deg med sin nåde til det evige livet. Fred vere med deg."
						}
					],
					"selAlt": 0,
					"selIntro": 0,
					"selAvsl": 0,
					"enabled": true,
					"optional": true,
					"salmeNr": "",
					"salmeTittel": ""
				},
				{
					"id": "dap-nn-presentasjon-av-den-døpte",
					"type": "tekst",
					"heading": "Presentasjon av den døpte",
					"instr": "",
					"text": "@NOTAT Ein vender barnet mot kyrkjelyden og kan lyfta det opp. Større born, unge eller vaksne vender seg mot kyrkjelyden. Ein seier følgjande ord:\n{{r}}L |{{/r}} Dette er NN, Guds barn, døypt inn i vår kyrkjelyd og Kristi verdsvide kyrkje.",
					"alts": [],
					"introAlts": [],
					"avslutningAlts": [],
					"selAlt": 0,
					"selIntro": 0,
					"selAvsl": 0,
					"enabled": true,
					"optional": true,
					"salmeNr": "",
					"salmeTittel": ""
				},
				{
					"id": "dap-nn-dåpslyset",
					"type": "tekst",
					"heading": "Dåpslyset",
					"instr": "",
					"text": "@NOTAT Etter kvar dåp og presentasjon kan ein tenna eit lys. Lystenning kan koma her eller under forbøna i gudstenesta. Liturgen kan seia:\n{{r}}L |{{/r}} Eit lys er tent for NN.\n@NOTAT Lysa set ein i ein lyshaldar. Når alle dåpslysa er tende, seier liturgen:\n{{r}}L |{{/r}} Jesus seier: «Eg er lyset i verda. Den som følgjer meg, skal ikkje vandra i mørkret, men ha livsens lys.»\nBIBELREF | Joh 8,12",
					"alts": [],
					"introAlts": [],
					"avslutningAlts": [],
					"selAlt": 0,
					"selIntro": 0,
					"selAvsl": 0,
					"enabled": true,
					"optional": true,
					"salmeNr": "",
					"salmeTittel": ""
				},
				{
					"id": "dap-nn-7-bøn-og-lovprising",
					"type": "tekst",
					"heading": "7 Bøn og lovprising",
					"instr": "Ein les bøna her eller under forbøna.",
					"text": "",
					"alts": [
						{
							"label": "A",
							"text": "{{r}}ML/L |{{/r}} Trufaste Gud, vi takkar deg for dåpen, der du tek imot oss og kallar oss med namn. Vi bed for NN/borna/dei som er døypt/døypte i dag. Ver med henne/han/dei gjennom livet og vara henne/han/dei i dåpens nåde. Styrk foreldra og fadrane i oppgåva dei har fått.\nGud, høyr vår bøn."
						},
						{
							"label": "B",
							"text": "{{r}}ML/L |{{/r}} Trufaste Gud, Vi takkar deg for dåpen, der du tek oss inn i di kyrkje. Vi bed for NN/borna/dei som er døypt/døypte i dag. Hald di vernande hand over henne/han/dei, og gje kjærleik og visdom til alle som har ansvar for henne/han/dei.\nGud, høyr vår bøn."
						},
						{
							"label": "C",
							"text": "{{r}}ML/L |{{/r}} Trufaste Gud, vi takkar deg for dåpen, og for lovnaden om at Jesus er med oss alle våre dagar. Vi bed for NN/dei som er døypt/døypte i dag. Vara henne/han/dei i trua på deg, så ho/han/dei kan vandra i lyset og nå det evige målet i ditt rike.\nGud, høyr vår bøn."
						}
					],
					"introAlts": [
						{
							"label": "Innledning",
							"text": "{{r}}L |{{/r}} Lat oss takka og be."
						}
					],
					"avslutningAlts": [],
					"selAlt": 0,
					"selIntro": 0,
					"selAvsl": 0,
					"enabled": true,
					"optional": true,
					"salmeNr": "",
					"salmeTittel": ""
				},
				{
					"id": "dap-nn-fadervår-dåpsliturgien",
					"type": "tekst",
					"heading": "Fadervår (dåpsliturgien)",
					"instr": "Fadervår blir sagt fram. Dersom det er nattverd i gudstenesta, kan Fadervår utelatast her. Det er også høve til å bruka Fadervår etter 1977-liturgien.",
					"text": "{{r}}A |{{/r}} Vår Far i himmelen.\nLat namnet ditt helgast.\nLat riket ditt koma.\nLat viljen din råda på jorda slik som i himmelen.\nGjev oss i dag vårt daglege brød,\nog tilgjev oss vår skuld,\nslik vi òg tilgjev våre skuldnarar.\nOg lat oss ikkje koma i freisting,\nmen frels oss frå det vonde.\nFor riket er ditt og makta og æra i all æve.\nAmen.",
					"alts": [],
					"introAlts": [
						{
							"label": "Innledning",
							"text": "{{r}}L |{{/r}} Lat oss saman be den bøna Jesus har lært oss:"
						}
					],
					"avslutningAlts": [],
					"selAlt": 0,
					"selIntro": 0,
					"selAvsl": 0,
					"enabled": true,
					"optional": true,
					"salmeNr": "",
					"salmeTittel": ""
				},
				{
					"id": "dap-nn-lovprisning",
					"type": "tekst",
					"heading": "Lovprisning",
					"instr": "",
					"text": "{{r}}L |{{/r}} Velsigna er Gud, vår Herre Jesu Kristi Far, han som i si store miskunn har fødd oss på nytt til ei levande von ved Jesu Kristi oppstode frå dei døde!\nBIBELREF | 1 Pet 1,3",
					"alts": [],
					"introAlts": [],
					"avslutningAlts": [],
					"selAlt": 0,
					"selIntro": 0,
					"selAvsl": 0,
					"enabled": true,
					"optional": true,
					"salmeNr": "",
					"salmeTittel": ""
				},
				{
					"id": "dap-nn-evt-song",
					"type": "tekst",
					"heading": "Evt. song",
					"instr": "Dåpsliturgien blir eventuelt avslutta med song, jf. rubrikk til punkt 2.",
					"text": "",
					"alts": [],
					"introAlts": [],
					"avslutningAlts": [],
					"selAlt": 0,
					"selIntro": 0,
					"selAvsl": 0,
					"enabled": true,
					"optional": true,
					"salmeNr": "",
					"salmeTittel": ""
				}
			]
		}
		],
		"visInstr": true,
		"visRoles": true,
		"visSalmeinfo": true,
		"malForm": "nynorsk",
		"builtinKey": "original-dåp-i-hovedgudstjenesten-(2017)",
		"wip": true,
		"erOriginal": true
},
]

export { WIP_MALER as WIP_TEMPLATES };
