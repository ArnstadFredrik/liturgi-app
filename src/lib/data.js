export const BUILTIN_TEMPLATES = [
	{
	"id": "hovedgudstjeneste2020",
	"name": "Ordning for hovedgudstjeneste (bokmål, 2020)",
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
					"text": "Kirkerommet er åpent en stund før gudstjenesten, med anledning til stillhet, lystenning og bønn.\nKlokkeringing\nHer eller etter ledd 3 Hilsen kan det være kort informasjon om dagens gudstjeneste ved medliturg eller liturg. Informasjonen avsluttes med:\nML | La oss være stille for Gud.\nKort stillhet. Tre klokkeslag.",
					"enabled": false
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
							"text": "L | Nåde være med dere og fred\nfra Gud, vår Far, og Herren Jesus Kristus."
						},
						{
							"label": "Vår Herre Jesu Kristi nåde …",
							"text": "L | Vår Herre Jesu Kristi nåde, Guds kjærlighet\nog Den hellige ånds samfunn være med dere alle."
						},
						{
							"label": "I Faderens og Sønnens og Den hellige ånds navn",
							"text": "L | I Faderens og Sønnens og Den hellige ånds navn."
						},
						{
							"label": "I Faderens og Sønnens og Den hellige ånds navn: Vår skaper …",
							"text": "L | I Faderens og Sønnens og Den hellige ånds navn:\nVår skaper, frigjører og livgiver."
						}
					]
				},
				{
					"id": "s4",
					"type": "tekst",
					"heading": "4 Samlingsbønn",
					"instr": "Se samlingsbønner og bruken av disse.",
					"alts": [
						{
							"label": "Samlingsbønn 1",
							"text": "ML | Gud, vi er kommet inn i ditt hellige hus for å ta imot det du vil gi oss.\nLukk nå opp våre hjerter, så vi kan fornyes i troen på deg."
						},
						{
							"label": "Samlingsbønn 2",
							"text": "ML | Hellige Gud, vi er samlet for ditt ansikt for å møte din kjærlighet og sannhet.\nSend oss din Ånd og gjør oss åpne for det du vil gi oss. La ditt ord slå rot i våre hjerter, så Kristus lever i oss, og vi blir ett i deg og tjener deg i alle ting."
						},
						{
							"label": "Samlingsbønn 3",
							"text": "ML | Gode Gud, du som gir liv til alt som lever, vi priser deg for jordens skjønnhet,\nog for alt som lar oss kjenne at du er god.\nHer for ditt ansikt ber vi: Gi oss lyttende ører, takknemlige hjerter og tjenende hender, så vi kan høre ditt ord, lovprise deg for din godhet, og i ord og gjerning vitne om dine storverk."
						}
					],
					"introAlts": [
						{
							"label": "Innledning",
							"text": "ML | La oss be."
						}
					],
					"avslutningAlts": [
						{
							"label": "Avslutning",
							"text": "ML | Gud, vi ber.\nA | Amen."
						}
					]
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
							"text": "A | Gud, vær meg nådig!\nJeg har syndet mot deg og sviktet min neste\n– med tanker og ord, med det jeg har gjort, og med det jeg har forsømt.\nTilgi meg min synd for Jesu Kristi skyld. Skap i meg et rent hjerte,\nog gi meg kraft til nytt liv ved din hellige Ånd."
						},
						{
							"label": "b – Gud, vær meg nådig! (kort)",
							"text": "A | Gud, vær meg nådig!\nTilgi meg min synd for Jesu Kristi skyld. Skap i meg et rent hjerte,\nog gi meg kraft til nytt liv ved din hellige Ånd."
						},
						{
							"label": "c – Gud, du kjenner og elsker oss alle",
							"text": "A | Gud, du kjenner og elsker oss alle. Du vil at vi skal ta vare på hverandre og på jorden.\nVi vet at vi svikter og gjør deg imot. Tilgi oss og hjelp oss, for Jesu skyld."
						},
						{
							"label": "d – Hellige Gud, vår skaper",
							"text": "A | Hellige Gud, vår skaper, se i nåde til oss.\nVi har syndet mot deg og brutt dine bud.\nTilgi oss for Jesu Kristi skyld. Sett oss fri til å tjene deg, verne om skaperverket og møte vår neste med kjærlighet."
						},
						{
							"label": "Syndsbekjennelse fra 1977-ordningen",
							"text": "Hellige Gud, himmelske Far, se i nåde til meg, syndige menneske, som har krenket deg med tanker, ord og gjerninger og kjenner lysten til det onde i mitt hjerte.\nFor Jesu Kristi skyld, ha langmodighet med meg.\nTilgi meg alle mine synder, og gi meg å frykte og elske deg alene."
						}
					],
					"introAlts": [
						{
							"label": "La oss bøye oss og bekjenne",
							"text": "L | La oss bøye oss for Gud og bekjenne våre synder."
						},
						{
							"label": "La oss bøye oss og be om tilgivelse",
							"text": "L | La oss bøye oss for Gud og be om tilgivelse."
						},
						{
							"label": "I tillit og bekjenne",
							"text": "L | I tillit til Guds nåde vil vi bekjenne våre synder."
						},
						{
							"label": "I tillit og be om tilgivelse",
							"text": "L | I tillit til Guds nåde vil vi be om tilgivelse."
						}
					],
					"avslutningAlts": [
						{
							"label": "Løftesord 1 Joh 1,9",
							"text": "L | Guds ord sier: Dersom vi bekjenner våre synder, er han trofast og rettferdig, så han tilgir oss syndene og renser oss for all urett.\nBIBELREF | 1 Joh 1,9"
						},
						{
							"label": "Løftesord Sal 103,11-12",
							"text": "L | Så høy som himmelen er over jorden, så veldig er hans miskunn over dem som frykter ham. Så langt som øst er fra vest, tar han syndene våre bort fra oss.\nBIBELREF | Sal 103,11-12"
						}
					]
				},
				{
					"id": "s6",
					"type": "tekst",
					"heading": "6–7 Bønnerop KYRIE og lovsang GLORIA",
					"instr": "Gloria kan utelates i fastetiden. Musikken hentes fra Den norske kirkes fem godkjente serier.",
					"alts": [
						{
							"label": "Allmenn serie 1",
							"text": "A | Kyrie eleison. Gud Fader, miskunne deg. Kriste eleison. Herre Krist, miskunne deg. Kyrie eleison. Hellig Ånd, miskunne deg.\nL/ML | Ære være Gud i det høyeste\nA | og fred på jorden blant mennesker som Gud har glede i. Vi lover deg, vi priser deg, vi tilber deg, vi opphøyer deg. Amen."
						},
						{
							"label": "Allmenn serie 2",
							"text": "A | Kyrie eleison. Miskunne deg over oss.\nKriste eleison. Miskunne deg over oss. Kyrie eleison. Miskunne deg over oss.\nL/ML | Ære være Gud i det høyeste\nA | og fred på jorden blant mennesker som Gud har glede i. Vi lover deg, vi priser deg, vi tilber deg, vi opphøyer deg. Amen."
						},
						{
							"label": "Allmenn serie 3",
							"text": "ML | Herre, miskunne deg. M | Herre, miskunne deg. ML | Kristus, miskunne deg. M | Kristus, miskunne deg. ML | Herre, miskunne deg. M | Herre, miskunne deg.\nL/ML | Ære være Gud i det høyeste.\nM | Ære være Gud i det høyeste.\nML | Herre, vi lover, Herre, vi priser deg.\nM | Ære være Gud i det høyeste. Amen."
						},
						{
							"label": "Serie for festtidene",
							"text": "ML | Kyrie eleison. M | Kyrie eleison. ML | Kriste eleison. M | Kriste eleison. ML | Kyrie eleison. M | Kyrie eleison.\nL/ML | Ære være Gud i det høyeste\nA | og fred på jorden blant mennesker som Gud har glede i. Vi lover deg, vi priser deg, vi tilber deg, vi opphøyer deg. Amen."
						},
						{
							"label": "Serie for fastetiden (uten gloria)",
							"text": "A | Kyrie eleison. Herre, miskunne deg.\nKriste eleison. Kristus, miskunne deg. Kyrie eleison. Herre, miskunne deg."
						}
					]
				},
				{
					"id": "s8",
					"type": "tekst",
					"heading": "8 Dagens bønn",
					"optional": true,
					"instr": "Bønnen kan utelates. Bønnen synges eller fremsies. Innledes med L | La oss alle be. Avsluttes med M | Amen.",
					"text": "L | La oss alle be.\n[Dagens bønn]\nM | Amen."
				}
			]
		},
		{
			"title": "Dåp",
			"items": [
				{
					"id": "h-l-dap",
					"type": "instruks",
					"heading": "DÅP",
					"optional": true,
					"instr": "Dåp i hovedgudstjenesten skjer normalt her (ettersatt foran Dagens bønn i ordningen)."
				},
				{
					"id": "h-l-dap1",
					"type": "tekst",
					"heading": "Inngangsord",
					"optional": true,
					"text": "L | I Faderens og Sønnens og Den hellige ånds navn."
				},
				{
					"id": "h-l-dap2",
					"type": "tekst",
					"heading": "Mottakelse til dåp",
					"optional": true,
					"text": "L | Med takk og glede bringer vi i dag dette barnet/disse barna til Gud i den hellige dåp. I dåpen tar Gud imot oss og forener oss med den korsfestede og oppstandne Jesus Kristus."
				},
				{
					"id": "h-l-dap3",
					"type": "tekst",
					"heading": "Bibelord",
					"optional": true,
					"text": "L | La oss høre hvor vennlig Jesus tar imot barna og åpner Guds rike for oss:\nKlokker/dåpsfølge | De bar små barn til ham for at han skulle røre ved dem, men disiplene viste dem bort. Da Jesus så det, ble han sint og sa til dem: «La de små barna komme til meg, og hindre dem ikke! For Guds rike tilhører slike som dem. Sannelig, jeg sier dere: Den som ikke tar imot Guds rike slik som et lite barn, skal ikke komme inn i det.» Og han tok dem inn til seg, la hendene på dem og velsignet dem. Mark 10,13-16"
				},
				{
					"id": "h-l-dap4",
					"type": "tekst",
					"heading": "Takkebønn",
					"optional": true,
					"text": "L | La oss takke og be:\nEvige Gud, du som gir liv til alt som lever, og har skapt oss i ditt bilde:\nVi takker deg for NN. Hun/Han/De er dyrebar(e) i dine øyne. Omslutt henne/ham/dem med din kjærlighet og gi henne/ham/dem et hjem i din kirke. Amen."
				},
				{
					"id": "h-l-dap5",
					"type": "salme",
					"heading": "Evt. dåpssalme",
					"optional": true
				},
				{
					"id": "h-l-dap6",
					"type": "tekst",
					"heading": "Dåpsbefalingen",
					"optional": true,
					"text": "L | La oss høre vår Herre Jesu Kristi ord om dåpen og troen:\nKlokker/dåpsfølge | Jeg har fått all makt i himmelen og på jorden. Gå derfor og gjør alle folkeslag til disipler: Døp dem til Faderens og Sønnens og Den hellige ånds navn og lær dem å holde alt det jeg har befalt dere. Og se, jeg er med dere alle dager inntil verdens ende. Matt 28,18-20"
				},
				{
					"id": "h-l-dap7",
					"type": "tekst",
					"heading": "Fadderansvaret",
					"optional": true,
					"text": "L | Vil foreldre og faddere reise seg.\nDere skal være vitner om at dette barnet/disse barna er døpt med den kristne dåp. Sammen med vår menighet og hele kirken får dere del i et hellig ansvar: å vise omsorg for henne/ham/dem, be for henne/ham/dem, lære henne/ham/dem selv å be og hjelpe henne/ham/dem til å bruke Guds ord og delta i den hellige nattverd, så hun/han/de kan leve og vokse i den kristne tro."
				},
				{
					"id": "h-l-dap8",
					"type": "tekst",
					"heading": "Forsakelsen og troen",
					"optional": true,
					"text": "L | La oss sammen bekjenne forsakelsen og troen som vi døpes til.\nAlle reiser seg.\nA | Jeg forsaker djevelen og alle hans gjerninger og alt hans vesen.\nJeg tror på Gud Fader, den allmektige, himmelens og jordens skaper.\nJeg tror på Jesus Kristus,\nGuds enbårne Sønn, vår Herre,\nsom ble unnfanget ved Den hellige ånd,\nfødt av jomfru Maria,\npint under Pontius Pilatus,\nkorsfestet, død og begravet,\nfór ned til dødsriket,\nstod opp fra de døde tredje dag,\nfór opp til himmelen,\nsitter ved Guds, den allmektige Faders høyre hånd,\nskal derfra komme igjen\nfor å dømme levende og døde.\nJeg tror på Den hellige ånd,\nen hellig, allmenn kirke,\nde helliges samfunn,\nsyndenes forlatelse,\nlegemets oppstandelse\nog det evige liv.\nAmen."
				},
				{
					"id": "h-l-dap9",
					"type": "tekst",
					"heading": "Bønn ved døpefonten",
					"optional": true,
					"text": "L | Barmhjertige Gud, vi takker deg for at dåpens vann ved ditt ord er en nådens kilde, der du tilgir oss vår synd, frelser oss fra dødens makt og gir oss løfte om det evige liv. Send din Ånd så hun/han/de som døpes reises opp til det nye livet med Jesus Kristus, vår Herre."
				},
				{
					"id": "h-l-dap10",
					"type": "tekst",
					"heading": "Dåpshandlingen",
					"optional": true,
					"text": "L | Hva heter barnet?\n(Den som bærer barnet, sier barnets fornavn.)\nL | Vil dere at NN skal døpes til Faderens og Sønnens og Den hellige ånds navn og oppdras til et liv i den kristne forsakelse og tro?\n(Den som bærer barnet, foreldre/foresatte og faddere, svarer: Ja.)\nL | Gud bevare din utgang og din inngang fra nå og til evig tid.\nJeg tegner deg med det hellige korsets tegn ✠ til vitnesbyrd om at du skal tilhøre den korsfestede og oppstandne Jesus Kristus og tro på ham.\nL | NN, etter vår Herre Jesu Kristi ord og befaling døper jeg deg til Faderens og Sønnens og Den hellige ånds navn.\n(Rikelig med vann over hodet, tre ganger.)\nL | Den allmektige Gud har i dåpen gitt deg sin hellige Ånd, født deg på ny og tatt deg inn i sin troende menighet. Gud styrke deg med sin nåde til det evige liv.\nFred være med deg.\n(Dette er NN, Guds barn, døpt inn i vår menighet og Kristi verdensvide kirke.)"
				},
				{
					"id": "h-l-dap11",
					"type": "tekst",
					"heading": "Dåpslyset",
					"optional": true,
					"text": "L | Et lys er tent for NN.\nLysene settes i en lysholder.\nNår alle dåpslysene er tent, sier liturgen:\nL | Jesus sier: «Jeg er verdens lys. Den som følger meg, skal ikke vandre i mørket, men ha livets lys.» Joh 8,12"
				},
				{
					"id": "h-l-dap12",
					"type": "tekst",
					"heading": "Velsignelsessang (N13 638)",
					"optional": true,
					"instr": "Alle synger til dåpsbarnet, én gang pr. barn.",
					"text": "Må Gud velsigne deg!\nMå Gud velsigne deg!\nHvert minutt av din tid,\nhver en dag av ditt liv.\nMå Gud velsigne deg."
				},
				{
					"id": "h-l-dap13",
					"type": "tekst",
					"heading": "Bønn",
					"optional": true,
					"text": "L | La oss takke og be.\nTrofaste Gud,\nvi takker deg for dåpen,\nder du tar oss inn i din kirke.\nVi ber for NN/barna/dem som er døpt i dag.\nHold din vernende hånd over henne/ham/dem,\nog gi kjærlighet og visdom til alle som har ansvar for henne/ham/dem.\nGud, hør vår bønn."
				},
				{
					"id": "h-l-dap14",
					"type": "tekst",
					"heading": "Lovprisning",
					"optional": true,
					"text": "L | Lovet være Gud, vår Herre Jesu Kristi Far, han som i sin rike miskunn har født oss på ny til et levende håp ved Jesu Kristi oppstandelse fra de døde. 1 Pet 1,3"
				},
				{
					"id": "h-l-dap15",
					"type": "salme",
					"heading": "Evt. dåpssalme e.l.",
					"optional": true
				}
			]
		},
		{
			"title": "II. Ordet",
			"items": [
				{
					"id": "o0",
					"type": "instruks",
					"heading": "Inngang til Ordet",
					"optional": true,
					"text": "I andre hovedgudstjenester enn høymessen kan det være to lesninger, eller én lesning (evangeliet). Menigheten står under evangelielesningen og sitter under de øvrige lesningene.\nL/ML | La oss høre Herrens ord."
				},
				{
					"id": "o9",
					"type": "lesning",
					"heading": "9 Første lesning",
					"label": "Fra Det gamle testamentet",
					"text": "ML | Det står skrevet i …\n\n[Lesningstekst]\nML | Slik lyder Herrens ord."
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
					"text": "ML | Det står skrevet i …\n\n[Lesningstekst]\nML | Slik lyder Herrens ord."
				},
				{
					"id": "o12",
					"type": "lesning",
					"heading": "* 12 Evangelium",
					"instr": "Innledes med hallelujaomkved eller salmevers med hallelujaomkved (N13: 977.1-7). I fastetiden erstattes halleluja av tractus, f.eks. N13: 926, 927, 928, 932, 939.",
					"text": "L | Det står skrevet i evangeliet etter …\n\n[Evangelietekst]\nL | Slik lyder det hellige evangelium."
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
							"text": "L | Ære være Faderen og Sønnen og Den hellige ånd,\nsom var og er og blir én sann Gud fra evighet og til evighet."
						},
						{
							"label": "Lovprisning (kort form)",
							"text": "L | Ære være Faderen og Sønnen og Den hellige ånd: Vår skaper, frigjører og livgiver."
						}
					]
				},
				{
					"id": "o14",
					"type": "tekst",
					"heading": "* 14 Trosbekjennelse CREDO",
					"instr": "Innledes med ML/L | La oss bekjenne vår hellige tro. Kan utelates ved dåp.",
					"alts": [
						{
							"label": "Den apostoliske trosbekjennelse",
							"text": "A | Jeg tror på Gud Fader, den allmektige, himmelens og jordens skaper.\nJeg tror på Jesus Kristus,\nGuds enbårne Sønn, vår Herre,\nsom ble unnfanget ved Den hellige ånd, født av jomfru Maria,\npint under Pontius Pilatus, korsfestet, død og begravet, fór ned til dødsriket,\nstod opp fra de døde tredje dag, fór opp til himmelen,\nsitter ved Guds, den allmektige Faders høyre hånd, skal derfra komme igjen\nfor å dømme levende og døde.\nJeg tror på Den hellige ånd, en hellig, allmenn kirke, de helliges samfunn, syndenes forlatelse, legemets oppstandelse\nog det evige liv.\nAmen."
						},
						{
							"label": "Den nikenske trosbekjennelse",
							"text": "A | Vi tror på én Gud, den allmektige Far,\nsom har skapt himmel og jord, alt synlig og usynlig.\nVi tror på én Herre, Jesus Kristus, Guds enbårne Sønn,\nfødt av Faderen før alle tider, Gud av Gud, lys av lys,\nsann Gud av sann Gud, født, ikke skapt,\nav samme vesen som Faderen. Ved ham er alt blitt skapt.\nFor oss mennesker og til vår frelse steg han ned fra himmelen,\nog ved Den hellige ånd og av jomfru Maria ble han menneske av kjøtt og blod.\nHan ble korsfestet for oss under Pontius Pilatus, led og ble begravet,\noppstod den tredje dag etter Skriftene og fór opp til himmelen,\nsitter ved Faderens høyre hånd, skal komme igjen i herlighet for å dømme levende og døde, og hans rike skal være uten ende.\nVi tror på Den hellige ånd, som er Herre og gjør levende,\nsom utgår fra Faderen og Sønnen,\ntilbes og æres sammen med Faderen og Sønnen, og som har talt gjennom profetene.\nVi tror på én hellig, allmenn og apostolisk kirke.\nVi bekjenner én dåp til syndenes forlatelse og venter de dødes oppstandelse\nog et liv i den kommende verden. Amen."
						}
					]
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
					"enabled": false
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
							"text": "A | Gud, vær meg nådig!\nJeg har syndet mot deg og sviktet min neste\n– med tanker og ord, med det jeg har gjort, og med det jeg har forsømt.\nTilgi meg min synd for Jesu Kristi skyld. Skap i meg et rent hjerte,\nog gi meg kraft til nytt liv ved din hellige Ånd."
						},
						{
							"label": "b – Gud, vær meg nådig! (kort)",
							"text": "A | Gud, vær meg nådig!\nTilgi meg min synd for Jesu Kristi skyld. Skap i meg et rent hjerte,\nog gi meg kraft til nytt liv ved din hellige Ånd."
						},
						{
							"label": "c – Gud, du kjenner og elsker oss alle",
							"text": "A | Gud, du kjenner og elsker oss alle. Du vil at vi skal ta vare på hverandre og på jorden.\nVi vet at vi svikter og gjør deg imot. Tilgi oss og hjelp oss, for Jesu skyld."
						},
						{
							"label": "d – Hellige Gud, vår skaper",
							"text": "A | Hellige Gud, vår skaper, se i nåde til oss.\nVi har syndet mot deg og brutt dine bud.\nTilgi oss for Jesu Kristi skyld. Sett oss fri til å tjene deg, verne om skaperverket og møte vår neste med kjærlighet."
						},
						{
							"label": "Syndsbekjennelse fra 1977-ordningen",
							"text": "Hellige Gud, himmelske Far, se i nåde til meg, syndige menneske, som har krenket deg med tanker, ord og gjerninger og kjenner lysten til det onde i mitt hjerte.\nFor Jesu Kristi skyld, ha langmodighet med meg.\nTilgi meg alle mine synder og gi meg å frykte og elske deg alene."
						}
					],
					"introAlts": [
						{
							"label": "Budord (Matt 22,37-39)",
							"text": "L | Vår Herre Jesus Kristus sier: Du skal elske Herren din Gud av hele ditt hjerte og av hele din sjel og av all din forstand. Dette er det største og første budet. Men det andre er like stort: Du skal elske din neste som deg selv.\nBIBELREF | Matt 22,37-39"
						},
						{
							"label": "La oss bøye oss og bekjenne",
							"text": "L | La oss bøye oss for Gud og bekjenne våre synder."
						},
						{
							"label": "La oss bøye oss og be om tilgivelse",
							"text": "L | La oss bøye oss for Gud og be om tilgivelse."
						},
						{
							"label": "I tillit og bekjenne",
							"text": "L | I tillit til Guds nåde vil vi bekjenne våre synder."
						},
						{
							"label": "I tillit og be om tilgivelse",
							"text": "L | I tillit til Guds nåde vil vi be om tilgivelse."
						}
					],
					"avslutningAlts": [
						{
							"label": "Løftesord 1 Joh 1,9",
							"text": "L | Guds ord sier: Dersom vi bekjenner våre synder, er han trofast og rettferdig, så han tilgir oss syndene og renser oss for all urett.\nBIBELREF | 1 Joh 1,9"
						},
						{
							"label": "Løftesord Sal 103,11-12",
							"text": "L | Så høy som himmelen er over jorden, så veldig er hans miskunn over dem som frykter ham. Så langt som øst er fra vest, tar han syndene våre bort fra oss.\nBIBELREF | Sal 103,11-12"
						}
					]
				},
				{
					"id": "o18",
					"type": "tekst",
					"heading": "18 Forbønn for kirken og verden",
					"instr": "Forbønnen ledes fortrinnsvis av en medliturg. Temaområder: Jordens folk og nasjoner / Vårt land og folk / Den verdensvide kirke / Vår menighet, familier og bosted / Aktuelle hendelser. Hvert avsnitt avsluttes med bønskeropet, og menighetssvaret gjentas. Etter siste avsnitt synger alle Amen. Etter siste bønneavsnitt synger alle Amen. Her kan ev. følge Fadervår.",
					"alts": [
						{
							"label": "Menighetssvar: Herre, hør vår bønn.",
							"text": "M | Herre, hør vår bønn."
						},
						{
							"label": "Menighetssvar: Hør vår bønn. La ditt rike komme …",
							"text": "M | Hør vår bønn. Hør vår bønn. La ditt rike komme, la din vilje skje, Gud! Hør vår bønn."
						},
						{
							"label": "Menighetssvar: Herre, hør vår bønn. (sunget serie 3)",
							"text": "M | Herre, hør vår bønn."
						},
						{
							"label": "Menighetssvar: Herre, vår Gud, hør oss når vi ber.",
							"text": "M | Herre, vår Gud, hør oss når vi ber."
						}
					],
					"introAlts": [
						{
							"label": "Innledning",
							"text": "ML/L | La oss be for kirken og verden."
						}
					],
					"avslutningAlts": [
						{
							"label": "Minnedel — Sal 90,12",
							"text": "ML/L | Vi reiser oss og minnes dem i vår menighet det er holdt gravferd for siden sist vi var samlet.\nMenigheten reiser seg. Navnene til de avdøde leses opp. Kort stillhet.\nML/L | Lær oss å telle våre dager så vi kan få visdom i hjertet! Sal 90,12\n\nDeretter kan denne eller en lignende bønn bes:\nML/L | Barmhjertige Gud, trøst de sørgende og vær dem nær i tiden som kommer."
						},
						{
							"label": "Minnedel — Joh 11,25",
							"text": "ML/L | Vi reiser oss og minnes dem i vår menighet det er holdt gravferd for siden sist vi var samlet.\nMenigheten reiser seg. Navnene til de avdøde leses opp. Kort stillhet.\nML/L | Jesus sier: «Jeg er oppstandelsen og livet. Den som tror på meg, skal leve om han enn dør.» Joh 11,25\n\nDeretter kan denne eller en lignende bønn bes:\nML/L | Barmhjertige Gud, trøst de sørgende og vær dem nær i tiden som kommer."
						},
						{
							"label": "Minnedel — N13 872,5",
							"text": "ML/L | Vi reiser oss og minnes dem i vår menighet det er holdt gravferd for siden sist vi var samlet.\nMenigheten reiser seg. Navnene til de avdøde leses opp. Kort stillhet.\nML/L | Nå er livet gjemt hos Gud. Vi overgir alt til ham. Håpet er tent i liv og død. Ingen er glemt av Gud. (N13: 872,5)\n\nDeretter kan denne eller en lignende bønn bes:\nML/L | Barmhjertige Gud, trøst de sørgende og vær dem nær i tiden som kommer."
						}
					]
				},
				{
					"id": "o18b",
					"type": "tekst",
					"heading": "Vi minnes de døde og ber for de sørgende",
					"optional": true,
					"instr": "Forbønnen kan avsluttes med at menigheten minnes dem som er døde, og som det er holdt gravferd for siden sist. Menigheten reiser seg. Navnene leses opp. Kort stillhet.",
					"text": "ML/L | Vi reiser oss og minnes dem i vår menighet det er holdt gravferd for siden sist vi var samlet.\n[Navn]\nML/L | Lær oss å telle våre dager så vi kan få visdom i hjertet! (Sal 90,12)\nML/L | Barmhjertige Gud, trøst de sørgende og vær dem nær i tiden som kommer."
				},
				{
					"id": "o19",
					"type": "tekst",
					"heading": "19 Takkoffer",
					"instr": "Kan samles inn her, under ledd 20 eller under ledd 27.",
					"text": "L | Evige Gud, din er jorden og det som fyller den. Alt vi eier tilhører deg. Av ditt eget gir vi deg tilbake.\nA/L | Ta imot oss og våre gaver i Jesu navn. Amen.",
					"enabled": false
				}
			]
		},
		{
			"title": "III. Nattverd",
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
					"text": "L synger eller sier | Herren være med dere.\nM reiser seg og synger | Og med deg være Herren.\nL | Løft deres hjerter.\nM | Vi løfter våre hjerter til Herren.\nL | La oss takke Herren vår Gud.\nM | Det er verdig og rett.",
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
							"text": "A synger | Hellig, hellig, hellig, er Herren Sebaot. All jorden er full\nav din herlighet. Hosianna i det høyeste. Velsignet være han som kommer i Herrens navn. Hosianna i det høyeste."
						},
						{
							"label": "Allmenn serie 3",
							"text": "ML og A synger\nML | Hellig, hellig, hellig er Herren vår Gud.\nA | Omkved: Hellig, hellig, hellig er Herren vår Gud.\nML | Du er Herre over himmel og jord.\nA | Omkved\nML | Du er herlig og mektig og stor.\nA | Omkved\nML | Du har sendt oss Jesus Kristus, din Sønn.\nA | Omkved\nML | Velsignet han som kommer i Herrens navn.\nA | Omkved"
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
							"text": "Vi priser deg, hellige Gud, himmelens og jordens Skaper, du som har elsket verden og gitt din Sønn, Jesus Kristus, for at han skulle frelse oss fra synd og død og vinne deg et hellig folk.\nL | Vi ber deg: Send din Ånd over disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen."
						},
						{
							"label": "Nattverdbønn b (etter Hippolyt, 200-tallet)",
							"text": "Vi priser deg Gud for Jesus Kristus, din tjener. Han kom fra himmelen, og ved Den hellige ånd og jomfru Maria ble han menneske av kjøtt og blod. Han oppfylte din vilje da han strakte ut sine hender på korsets tre. Slik tilintetgjorde han døden, brøt ondskapens lenker og åpenbarte oppstandelsen fra de døde. Derfor minnes vi hans død og oppstandelse når vi bærer brødet og vinen fram for deg.\nL | Vi ber deg: Send din hellige Ånd over disse gaver, så de for oss blir livets brød og frelsens beger."
						},
						{
							"label": "Nattverdbønn c (paulinske tekster)",
							"text": "Hellig og barmhjertig er du, Gud, som ikke vendte deg bort da mennesket syndet, men gav løfte til Abraham om velsignelse for alle folkeslag. Mektig og trofast er du, som befridde ditt folk fra trelldom, og fornyet løftene gjennom profetene.\nDa tiden var inne, sendte du din Sønn, født av Maria, for å kjøpe oss fri og gi oss retten til å være dine barn.\nVed hans død på korset forsonte du alt med deg selv og skapte fred, og ved hans oppstandelse ble døden overvunnet.\nL | Vi ber deg: Send din Ånd over disse dine gaver. Foren oss i troen på din nåde, så vi kan ta imot Jesu legeme og blod til forsoning og fred, og forkynne hans død til han kommer."
						},
						{
							"label": "Nattverdbønn d (Emmausfortellingen, Luk 24)",
							"text": "Vi takker deg, all godhets kilde. Du sendte din Sønn. Han ble korsfestet og stod opp fra de døde. Han åpnet skriftene og åpenbarte seg for sine venner da han brøt brødet og gav dem.\nL | Nå ber vi deg: La din hellige Ånd komme over brødet og vinen, så våre øyne åpnes, og vi kjenner ham igjen som vår korsfestede og oppstandne Frelser."
						},
						{
							"label": "Nattverdbønn e (bearbeidet etter familiemessen 2003)",
							"text": "Hellige Gud, vi takker deg for Jesus Kristus, verdens frelser. Han døde og stod opp igjen for å gi oss evig liv. Vi takker deg for dåpens gave, der vi blir født på ny, og for nattverden, der du samler oss som din store familie.\nL | Vi ber deg: Send din hellige Ånd over brødet og vinen. Gjør oss til ett med hverandre og med Jesus Kristus."
						},
						{
							"label": "Nattverdbønn f (kort – ved særskilte anledninger)",
							"text": "Vi takker deg for Jesus Kristus, vår frelser. Han er det levende brød som kommer ned fra himmelen og gir verden liv.\nL | Vi ber deg: Send din Ånd over oss og disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen."
						},
						{
							"label": "Nattverdbønn g (Gudstjenesteboken 1992, Johannesordningen)",
							"text": "Hellige Gud, uten ende er din miskunn, og evig er ditt herredømme. Du har fylt ditt skaperverk med lys og liv; himmelen og jorden er fulle av din herlighet. Gjennom Abraham lovte du å velsigne alle folkeslag. Du berget Israel, ditt utvalgte folk. Gjennom profetene fornyet du ditt løfte. Og da tiden var kommet, sendte du din Sønn, han som i ord og gjerning forkynte ditt rike og var lydig mot din vilje helt til døden.\nL | Vi ber deg: Send din Ånd over disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen."
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
							"text": "Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\nL/ML | Derfor, så ofte som vi spiser dette brødet og drikker av begeret, forkynner vi Herrens død, inntil han kommer."
						}
					],
					"selAlt": 0
				},
				{
					"id": "nattverd-troens-mysterium",
					"type": "tekst",
					"heading": "Troens mysterium",
					"optional": false,
					"text": "L | Stort er troens mysterium.\nA | Kristus døde. Kristus stod opp. Kristus skal komme igjen. Ham være ære for kjærligheten som er sterkere enn døden.",
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
							"text": "Derfor, barmhjertige Far, vil vi med dette brødet og dette begeret komme i hu at Herren gav sitt liv for oss. Og i troen på hans oppstandelse venter vi på at han kommer igjen i makt og herlighet og vil holde sitt store gjestebud sammen med sitt folk.\nA | Amen, ja, kom, Herre Jesus.\nL | Vi ber deg, allmektige Gud, gi oss din hellige Ånd. La oss kjenne kraften av Kristi oppstandelse, så vi som tar imot hans legeme og blod, kan leve til pris og ære for din herlighet og få del i den arven som de hellige får i lyset.\nA | Amen, ja, kom, du Hellige Ånd.\nL/ML | Foren vår bønn med bønnene fra dine tjenere alle steder og gjennom alle tider, og med forbønnen fra vår store øversteprest, som alltid ber for oss, inntil han kommer med seier, som Herren over alle ting. Ved ham og i ham og i samfunn med Den hellige ånd skal du ha all herlighet og ære, allmektige Far, evige Gud, nå og til evig tid."
						}
					],
					"selAlt": 0
				},
				{
					"id": "n21b",
					"type": "tekst",
					"heading": "Fadervår",
					"instr": "Fremsies eller synges (N13: 984.1 og 3, 985.1 og 3). Kan erstattes av Fadervår etter 1977- eller 1920-liturgiene.",
					"text": "A | Vår Far i himmelen! La navnet ditt helliges. La riket ditt komme.\nLa viljen din skje på jorden slik som i himmelen. Gi oss i dag vårt daglige brød,\nog tilgi oss vår skyld, slik også vi tilgir våre skyldnere. Og la oss ikke komme i fristelse, men frels oss fra det onde.\nFor riket er ditt og makten og æren i evighet. Amen."
				},
				{
					"id": "n22a",
					"type": "tekst",
					"heading": "* 22 Fredshilsen PAX",
					"instr": "Menigheten står helt til de første går fram til nattverd. Her kan en føye til: L/ML | La oss hilse hverandre med et tegn på fred. Menigheten hilser hverandre med håndtrykk.",
					"text": "L | Guds fred være med dere.\nM | Guds fred være med deg."
				},
				{
					"id": "n22b",
					"type": "tekst",
					"heading": "Du Guds Lam AGNUS DEI",
					"alts": [
						{
							"label": "Allmenn serie 1, 2, fest- og fasteserien",
							"text": "A | Du Guds Lam, som bærer verdens synder, miskunne deg over oss.\nDu Guds Lam, som bærer verdens synder, miskunne deg over oss.\nDu Guds Lam, som bærer verdens synder, gi oss din fred."
						},
						{
							"label": "Allmenn serie 3",
							"text": "ML | Amen, kom, Herre Jesus. A | Omkved: Amen, kom, Herre Jesus.\nML | Du er Lammet som bærer vår synd. A | Omkved\nML | Du er Lammet som gir oss din fred. A | Omkved\nML | Du er brødet som gir oss ditt liv. A | Omkved"
						}
					]
				},
				{
					"id": "n22c",
					"type": "tekst",
					"heading": "Invitasjon og utdeling",
					"instr": "L | Kom, for alt er gjort ferdig. (Kan alternativt gis før Du Guds Lam synges.) Utdelingsordet: Kristi kropp, gitt for deg. Kristi blod, gitt for deg. (Alternativt: Dette er Jesu legeme. Dette er Jesu blod.)\nEtter utdelingen:\nL | Den korsfestede og oppstandne Jesus Kristus har nå gitt oss sin kropp og sitt blod som han gav til soning for alle våre synder.\nA (eller L) | Han styrke oss og holde oss oppe i en sann tro til det evige liv.\nL | Fred være med dere."
				},
				{
					"id": "n23",
					"type": "tekst",
					"heading": "23 Måltidets avslutning – Takkebønn",
					"instr": "Innledes med L/ML | La oss takke og be. Alteret ryddes.",
					"alts": [
						{
							"label": "Takkebønn 1 (kan synges)",
							"text": "L/ML | Vi takker deg, himmelske Far, for dine velsignede gaver.\nVi ber deg at du ved disse gavene vil bevare oss i troen på deg, forene oss i din kjærlighet og stadfeste i oss håpet om det evige liv, for Jesu Kristi skyld.\nM | Amen."
						},
						{
							"label": "Takkebønn 2",
							"text": "L/ML | Vi takker deg, visdommens Gud, for ditt måltids dype hemmelighet: Brødet vi har brutt, er ett. Din Sønn har gitt sitt liv for én verden og én menneskehet. Vi ber:\nA/L/ML | Hjelp oss å høre det ropet du har hørt, å se den nøden du har sett, og å elske vår neste som oss selv."
						},
						{
							"label": "Takkebønn 3",
							"text": "L/ML | Vi takker deg, nådige Gud, du som gjennom brødet og vinen har gitt oss del i Jesu Kristi seierrike død og oppstandelse. Vi ber:\nA/L/ML | Styrk oss ved din Ånd til vitnesbyrd og tjeneste i verden."
						},
						{
							"label": "Takkebønn 4",
							"text": "L/ML | Trofaste Gud, du som i dåpen har gitt oss barnekår og gjort oss til arvinger i ditt rike. Vi takker deg for dette måltidet, hvor du har gitt oss syndenes forlatelse og fornyet i oss troen på dine løfter. Vi ber:\nA/L/ML | Styrk oss ved din Ånd til vitnesbyrd og tjeneste i verden."
						}
					]
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
							"text": "L/ML | La oss prise Herren.\nM | Gud være lovet. Halleluja. Halleluja. Halleluja.\nL | Herren velsigne deg og bevare deg.\nHerren la sitt ansikt lyse over deg og være deg nådig. Herren løfte sitt åsyn på deg og gi deg fred.\nM | Amen. Amen. Amen."
						},
						{
							"label": "Med hilsen SALUTATIO",
							"text": "L | Herren være med dere.\nM | Og med deg være Herren.\nL | Herren velsigne deg og bevare deg.\nHerren la sitt ansikt lyse over deg og være deg nådig. Herren løfte sitt åsyn på deg og gi deg fred.\nM | Amen. Amen. Amen."
						},
						{
							"label": "Ta imot velsignelsen",
							"text": "L | Ta imot velsignelsen.\nL | Herren velsigne deg og bevare deg.\nHerren la sitt ansikt lyse over deg og være deg nådig. Herren løfte sitt åsyn på deg og gi deg fred.\nM | Amen. Amen. Amen."
						}
					]
				},
				{
					"id": "e26",
					"type": "tekst",
					"heading": "* 26 Utsendelse",
					"instr": "Dersom menigheten blir sittende under postludiet, kan utsendelsesordene sies etter postludiet.",
					"alts": [
						{
							"label": "La oss gå i fred",
							"text": "L/ML | La oss gå i fred,\nA | i Jesu Kristi navn."
						},
						{
							"label": "Gå i fred. Tjen Herren med glede.",
							"text": "L/ML | Gå i fred. Tjen Herren med glede."
						}
					]
				},
				{
					"id": "e27",
					"type": "instruks",
					"heading": "* 27 Postludium/Utgangsprosesjon",
					"optional": true,
					"instr": "Dersom det er utgangsprosesjon, kan menigheten følge etter prosesjonen. I stedet for postludium kan det synges en salme mens menigheten går ut."
				}
			]
		}
	]
},
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
					"enabled": false
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
							"label": "Bakke og Gyland",
							"text": "L | Kjære menighet.\nNåde være med dere og fred fra Gud, vår Far, og Herren Jesus Kristus."
						},
						{
							"label": "Nåde være med dere og fred",
							"text": "L | Nåde være med dere og fred\nfra Gud, vår Far, og Herren Jesus Kristus."
						},
						{
							"label": "Vår Herre Jesu Kristi nåde …",
							"text": "L | Vår Herre Jesu Kristi nåde, Guds kjærlighet\nog Den hellige ånds samfunn være med dere alle."
						},
						{
							"label": "I Faderens og Sønnens og Den hellige ånds navn",
							"text": "L | I Faderens og Sønnens og Den hellige ånds navn."
						},
						{
							"label": "I Faderens og Sønnens og Den hellige ånds navn: Vår skaper …",
							"text": "L | I Faderens og Sønnens og Den hellige ånds navn:\nVår skaper, frigjører og livgiver."
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
							"text": "L | La oss alle be.\nTrofaste Gud,\ndu elsker oss som en kjærlig mor og far.\nVi ber deg:\nLær oss å lytte til dine ord,\nså vi blir rike på innsikt og kjærlighet,\nved din Sønn Jesus Kristus, vår Herre,\nsom med deg og Den hellige ånd lever og råder,\nén sann Gud fra evighet til evighet.\nA | Amen"
						},
						{
							"label": "Samlingsbønn 1",
							"text": "ML | Gud, vi er kommet inn i ditt hellige hus for å ta imot det du vil gi oss.\nLukk nå opp våre hjerter, så vi kan fornyes i troen på deg."
						},
						{
							"label": "Samlingsbønn 2",
							"text": "ML | Hellige Gud, vi er samlet for ditt ansikt for å møte din kjærlighet og sannhet.\nSend oss din Ånd og gjør oss åpne for det du vil gi oss. La ditt ord slå rot i våre hjerter, så Kristus lever i oss, og vi blir ett i deg og tjener deg i alle ting."
						},
						{
							"label": "Samlingsbønn 3",
							"text": "ML | Gode Gud, du som gir liv til alt som lever, vi priser deg for jordens skjønnhet,\nog for alt som lar oss kjenne at du er god.\nHer for ditt ansikt ber vi: Gi oss lyttende ører, takknemlige hjerter og tjenende hender, så vi kan høre ditt ord, lovprise deg for din godhet, og i ord og gjerning vitne om dine storverk."
						}
					],
					"optional": false,
					"selAlt": 0,
					"introAlts": [
						{
							"label": "Innledning",
							"text": "ML | La oss be."
						}
					],
					"avslutningAlts": [
						{
							"label": "Avslutning",
							"text": "ML | Gud, vi ber.\nA | Amen."
						}
					]
				},
				{
					"id": "l-6",
					"type": "tekst",
					"heading": "Syndsbekjennelse",
					"text": "",
					"instr": "Følger her, eller etter talen. Liturgen kneler under syndsbekjennelse og stillhet. Også menigheten kan knele.",
					"alts": [
						{
							"label": "a – Gud, vær meg nådig! (full)",
							"text": "A | Gud, vær meg nådig!\nJeg har syndet mot deg og sviktet min neste\n– med tanker og ord, med det jeg har gjort, og med det jeg har forsømt.\nTilgi meg min synd for Jesu Kristi skyld. Skap i meg et rent hjerte,\nog gi meg kraft til nytt liv ved din hellige Ånd."
						},
						{
							"label": "b – Gud, vær meg nådig! (kort)",
							"text": "A | Gud, vær meg nådig!\nTilgi meg min synd for Jesu Kristi skyld. Skap i meg et rent hjerte,\nog gi meg kraft til nytt liv ved din hellige Ånd."
						},
						{
							"label": "c – Gud, du kjenner og elsker oss alle",
							"text": "A | Gud, du kjenner og elsker oss alle. Du vil at vi skal ta vare på hverandre og på jorden.\nVi vet at vi svikter og gjør deg imot. Tilgi oss og hjelp oss, for Jesu skyld."
						},
						{
							"label": "d – Hellige Gud, vår skaper",
							"text": "A | Hellige Gud, vår skaper, se i nåde til oss.\nVi har syndet mot deg og brutt dine bud.\nTilgi oss for Jesu Kristi skyld. Sett oss fri til å tjene deg, verne om skaperverket og møte vår neste med kjærlighet."
						},
						{
							"label": "Syndsbekjennelse fra 1977-ordningen",
							"text": "Hellige Gud, himmelske Far, se i nåde til meg, syndige menneske, som har krenket deg med tanker, ord og gjerninger og kjenner lysten til det onde i mitt hjerte.\nFor Jesu Kristi skyld, ha langmodighet med meg.\nTilgi meg alle mine synder, og gi meg å frykte og elske deg alene."
						}
					],
					"optional": false,
					"introAlts": [
						{
							"label": "Bakke og Gyland",
							"text": "L | Vår Herre Jesus Kristus sier: Du skal elske Herren din Gud av hele ditt hjerte\nog av hele din sjel og av all din forstand. Dette er det største og første budet.\nMen det andre er like stort: Du skal elske din neste som deg selv.\nBIBELREF | Matt 22,37-39"
						},
						{
							"label": "La oss bøye oss og bekjenne",
							"text": "L | La oss bøye oss for Gud og bekjenne våre synder."
						},
						{
							"label": "La oss bøye oss og be om tilgivelse",
							"text": "L | La oss bøye oss for Gud og be om tilgivelse."
						},
						{
							"label": "I tillit og bekjenne",
							"text": "L | I tillit til Guds nåde vil vi bekjenne våre synder."
						},
						{
							"label": "I tillit og be om tilgivelse",
							"text": "L | I tillit til Guds nåde vil vi be om tilgivelse."
						}
					],
					"avslutningAlts": [
						{
							"label": "Løftesord 1 Joh 1,9",
							"text": "L | Guds ord sier: Dersom vi bekjenner våre synder, er han trofast og rettferdig, så han tilgir oss syndene og renser oss for all urett.\nBIBELREF | 1 Joh 1,9"
						},
						{
							"label": "Løftesord Sal 103,11-12",
							"text": "L | Så høy som himmelen er over jorden, så veldig er hans miskunn over dem som frykter ham. Så langt som øst er fra vest, tar han syndene våre bort fra oss.\nBIBELREF | Sal 103,11-12"
						}
					],
					"selAlt": 0
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
							"text": "A | Kyrie eleison. Gud Fader, miskunne deg.\nKriste eleison. Herre Krist, miskunne deg.\nKyrie eleison. Hellig Ånd, miskunne deg."
						},
						{
							"label": "Allmenn serie 1",
							"text": "A | Kyrie eleison. Gud Fader, miskunne deg. Kriste eleison. Herre Krist, miskunne deg. Kyrie eleison. Hellig Ånd, miskunne deg.\nL/ML | Ære være Gud i det høyeste\nA | og fred på jorden blant mennesker som Gud har glede i. Vi lover deg, vi priser deg, vi tilber deg, vi opphøyer deg. Amen."
						},
						{
							"label": "Allmenn serie 2",
							"text": "A | Kyrie eleison. Miskunne deg over oss.\nKriste eleison. Miskunne deg over oss. Kyrie eleison. Miskunne deg over oss.\nL/ML | Ære være Gud i det høyeste\nA | og fred på jorden blant mennesker som Gud har glede i. Vi lover deg, vi priser deg, vi tilber deg, vi opphøyer deg. Amen."
						},
						{
							"label": "Allmenn serie 3",
							"text": "ML | Herre, miskunne deg. M | Herre, miskunne deg. ML | Kristus, miskunne deg. M | Kristus, miskunne deg. ML | Herre, miskunne deg. M | Herre, miskunne deg.\nL/ML | Ære være Gud i det høyeste.\nM | Ære være Gud i det høyeste.\nML | Herre, vi lover, Herre, vi priser deg.\nM | Ære være Gud i det høyeste. Amen."
						},
						{
							"label": "Serie for festtidene",
							"text": "ML | Kyrie eleison. M | Kyrie eleison. ML | Kriste eleison. M | Kriste eleison. ML | Kyrie eleison. M | Kyrie eleison.\nL/ML | Ære være Gud i det høyeste\nA | og fred på jorden blant mennesker som Gud har glede i. Vi lover deg, vi priser deg, vi tilber deg, vi opphøyer deg. Amen."
						},
						{
							"label": "Serie for fastetiden (uten gloria)",
							"text": "A | Kyrie eleison. Herre, miskunne deg.\nKriste eleison. Kristus, miskunne deg. Kyrie eleison. Herre, miskunne deg."
						}
					],
					"optional": false,
					"selAlt": 0
				},
				{
					"id": "l-9",
					"type": "tekst",
					"heading": "Lovsang Gloria",
					"text": "L | Ære være Gud i det høyeste\nA  og fred på jorden blant mennesker som Gud har glede i.\nVi lover deg, vi priser deg, vi tilber deg, vi opphøyer deg. Amen.",
					"instr": "",
					"alts": [],
					"optional": false
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
					"instr": "Dåp i hovedgudtjenesten skjer normalt her. Forbered dåpsvann, dåpslys og verger.",
					"alts": [],
					"optional": false,
					"enabled": false
				},
				{
					"id": "l-11",
					"type": "tekst",
					"heading": "Dåp: Inngangsord",
					"text": "L | I Faderens og Sønnens og Den hellige ånds navn.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-12",
					"type": "tekst",
					"heading": "Dåp: Mottakelse til dåp",
					"text": "L | Med takk og glede bringer vi i dag dette barnet/disse barna til Gud i den hellige dåp. I dåpen tar Gud imot oss og forener oss med den korsfestede og oppstandne Jesus Kristus.\nFølgende skriftord kan leses:\nL | For så høyt har Gud elsket verden at han ga sin Sønn, den enbårne, for at hver den som tror på ham, ikke skal gå fortapt, men ha evig liv. Joh3,16",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-13",
					"type": "tekst",
					"heading": "Dåp: Bibelord",
					"text": "L | La oss høre hvor vennlig Jesus tar imot barna og åpner Guds rike for oss:\nKlokker / dåpsfølge  De bar små barn til ham for at han skulle røre ved dem, men disiplene viste dem bort. Da Jesus så det, ble han sint og sa til dem: «La de små barna komme til meg, og hindre dem ikke! For Guds rike tilhører slike som dem. Sannelig, jeg sier dere: Den som ikke tar imot Guds rike slik som et lite barn, skal ikke komme inn i det.» Og han tok dem inn til seg, la hendene på dem og velsignet dem. Mark 10,13-16",
					"instr": "",
					"alts": [],
					"optional": false
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
					"text": "L | La oss høre vår Herre Jesu Kristi ord om dåpen og troen:\nKlokker / dåpsfølge  Jeg har fått all makt i himmelen og på jorden. Gå derfor og gjør alle folkeslag til disipler: Døp dem til Faderens og Sønnens og Den hellige ånds navn og lær dem å holde alt det jeg har befalt dere. Og se, jeg er med dere alle dager inntil verdens ende. Matt 28,18-20",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-16",
					"type": "tekst",
					"heading": "Dåp: Fadderansvaret",
					"text": "L | Vil foreldre og faddere reise seg.\nDere skal være vitner om at dette barnet/disse barna er døpt med den kristne dåp. Sammen med vår menighet og hele kirken får dere del i et hellig ansvar: å vise omsorg for henne/ham/dem, be for henne/ham/dem, lære henne/ham/dem selv å be og hjelpe henne/ham/dem til å bruke Guds ord og delta i den hellige nattverd, så hun/han/de kan leve og vokse i den kristne tro.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-17",
					"type": "tekst",
					"heading": "Dåp: Forsakelsen og troen",
					"text": "L | La oss sammen bekjenne forsakelsen og troen som vi døpes til.\nAlle reiser seg.\nA | Jeg forsaker djevelen og alle hans gjerninger og alt hans vesen.\nJeg tror på Gud Fader, den allmektige,\nhimmelens og jordens skaper.\nJeg tror på Jesus Kristus,\nGuds enbårne Sønn, vår Herre,\nsom ble unnfanget ved Den hellige ånd,\nfødt av jomfru Maria,\npint under Pontius Pilatus,\nkorsfestet, død og begravet,\nfór ned til dødsriket,\nstod opp fra de døde tredje dag,\nfór opp til himmelen,\nsitter ved Guds, den allmektige Faders høyre hånd,\nskal derfra komme igjen\nfor å dømme levende og døde.\nJeg tror på Den hellige ånd,\nen hellig, allmenn kirke,\nde helliges samfunn,\nsyndenes forlatelse,\nlegemets oppstandelse\nog det evige liv.\nAmen.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-18",
					"type": "tekst",
					"heading": "Dåp: Bønn ved døpefonten",
					"text": "L | Barmhjertige Gud, vi takker deg for at dåpens vann ved ditt ord er en nådens kilde, der du tilgir oss vår synd, frelser oss fra dødens makt og gir oss løfte om det evige liv. Send din Ånd så hun/han/de som døpes reises opp til det nye livet med Jesus Kristus, vår Herre.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-19",
					"type": "tekst",
					"heading": "Dåp: Dåpshandlingen",
					"text": "L | Hva heter barnet?\nDen som bærer barnet, sier barnets fornavn.\nL | Vil dere at NN skal døpes til Faderens og Sønnens og Den hellige ånds navn og oppdras til et liv i den kristne forsakelse og tro?\nDen som bærer barnet, foreldre/foresatte og faddere, svarer:\nJa.\nVed dåp av større barn, unge eller voksne:\nL | Hva heter du?\nDen som skal døpes, svarer selv ved å si fornavnet sitt. Om nødvendig kan en annen si navnet.\nL | NN, vil du bli døpt til Faderens og Sønnens og Den hellige ånds navn og leve i den kristne forsakelse og tro?\nDen som skal døpes, svarer:\nJa.\nLiturgen vender seg mot barnets/dåpskandidatens ansikt og ber bønnen med åpen håndflate.\nL | Gud bevare din utgang og din inngang fra nå og til evig tid.\nJeg tegner deg med det hellige korsets tegn ✠ til vitnesbyrd om at du skal tilhøre den korsfestede og oppstandne Jesus Kristus og tro på ham.\nL | NN, etter vår Herre Jesu Kristi ord og befaling døper jeg deg til Faderens og Sønnens og Den hellige ånds navn.\nMens dette sies, øser liturgen med hånden rikelig med vann over hodet til den som døpes, tre ganger.\nLiturgen legger, gjerne sammen med fadderne, hånden på den døptes hode og sier:\nL | Den allmektige Gud har i dåpen gitt deg sin hellige Ånd,\nfødt deg på ny og tatt deg inn i sin troende menighet. Gud styrke deg med sin nåde til det evige liv.\nFred være med deg.\nBarnet vendes mot menigheten eller løftes opp. Ved dåp av større barn, unge eller voksne kan disse vende seg mot menigheten. Følgende ord sies:\nDette er NN, Guds barn, døpt inn i vår menighet og Kristi verdensvide kirke.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-20",
					"type": "tekst",
					"heading": "Dåp: Dåpslyset og dåpsengel",
					"text": "Etter hver dåp og presentasjon kan det tennes et lys. Liturgen kan si:\nL | Et lys er tent for NN.\nLysene settes i en lysholder.\nNår alle dåpslysene er tent, sier liturgen:\nL | Jesus sier: «Jeg er verdens lys. Den som følger meg, skal ikke vandre i mørket,men ha livets lys.» Joh 8,12",
					"instr": "",
					"alts": [],
					"optional": false
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
					"text": "L | La oss takke og be.\nTrofaste Gud,\nvi takker deg for dåpen,\nder du tar oss inn i din kirke.\nVi ber for NN/barna/dem som er døpt i dag.\nHold din vernende hånd over henne/ham/dem,\nog gi kjærlighet og visdom til alle som har ansvar for henne/ham/dem.\nGud, hør vår bønn.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-23",
					"type": "tekst",
					"heading": "Dåp: Lovprisning",
					"text": "L | Lovet være Gud, vår Herre Jesu Kristi Far, han som i sin rike miskunn har født oss på ny til et levende håp ved Jesu Kristi oppstandelse fra de døde. 1 Pet 1,3",
					"instr": "",
					"alts": [],
					"optional": false
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
					"text": "L/ML | La oss høre Herrens ord.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-26",
					"type": "lesning",
					"heading": "Første lesning",
					"text": "Det står skrevet i Ruts bok:\nNoomi dro bort fra stedet hvor hun hadde bodd, og begge svigerdøtrene fulgte henne.\nDe ga seg i vei for å vende tilbake til Juda. Men Noomi sa til sine to svigerdøtre: «Snu og gå tilbake, hver til sin mors hus! Måtte Herren vise godhet mot dere, slik dere har vist godhet mot de døde og mot meg! Måtte Herren gi dere begge trygghet og la dere finne et hjem, hver i sin manns hus!» Så kysset hun dem. Men de brast i gråt og sa til henne: «Nei, vi vil følge deg tilbake til ditt folk.» Men Noomi sa: «Vend tilbake, mine døtre! Hvorfor skulle dere følge med meg? Skulle jeg ennå føde sønner som dere kan få til menn?»\nMen Rut svarte: «Ikke tving meg til å forlate deg og vende tilbake, for:\nDit du går, vil jeg gå,\nog hvor du bor, vil jeg bo.\nDitt folk er mitt folk,\nog din Gud er min Gud.\nDer du dør, vil jeg dø,\nog der vil jeg begraves.\nMåtte Herren la det gå meg ille\nbåde nå og siden\nhvis noe annet enn døden\nskal skille meg fra deg!»\nDa Noomi så at hun sto fast på sitt og ville følge med henne, sa hun ikke mer til henne.\nSå gikk de begge videre til de kom til Betlehem.\nSlik lyder Herrens ord.\nrut 1,7–11.16–19a",
					"instr": "Rut 1,7-11.16-19a (eksempel)",
					"alts": [],
					"optional": false
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
					"text": "Det står skrevet i Paulus’ første brev til korinterne:\nKjærligheten utholder alt, tror alt,\nhåper alt, tåler alt.\nKjærligheten tar aldri slutt.\nProfetgavene skal bli borte,\ntungene skal tie\nog kunnskapen forgå.\nFor vi forstår stykkevis og taler profetisk stykkevis.\nMen når det fullkomne kommer,\nskal det som er stykkevis, ta slutt.\nDa jeg var barn, talte jeg som et barn,\ntenkte jeg som et barn, forsto jeg som et barn.\nMen da jeg ble voksen, la jeg av det barnslige.\nNå ser vi i et speil, i en gåte,\nda skal vi se ansikt til ansikt.\nNå forstår jeg stykkevis,\nda skal jeg erkjenne fullt ut,\nslik Gud kjenner meg fullt ut.\nSå blir de stående, disse tre: tro, håp og kjærlighet.\nMen størst blant dem er kjærligheten.\nSlik lyder Herrens ord.\n1 kor 13,7–13",
					"instr": "1 Kor 13,7-13 (eksempel)",
					"alts": [],
					"optional": true
				},
				{
					"id": "l-29",
					"type": "tekst",
					"heading": "Halleluja",
					"text": "L | La oss høre det hellige evangelium\nM | Halleluja, Halleluja, Halleluja, Halleluja",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-30",
					"type": "lesning",
					"heading": "Evangelium",
					"text": "Det står skrevet i evangeliet etter Johannes:\nSom Far har elsket meg, har jeg elsket dere. Bli i min kjærlighet! Hvis dere holder mine bud, blir dere i min kjærlighet, slik jeg har holdt min Fars bud og blir i hans kjærlighet. Dette har jeg sagt dere for at min glede kan være i dere og deres glede kan bli fullkommen. Og dette er mitt bud: Dere skal elske hverandre som jeg har elsket dere.\nSlik lyder det hellige evangelium.\njoh 15,9–12",
					"instr": "Joh 15,9-12 (eksempel)",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-31",
					"type": "tekst",
					"heading": "Respons",
					"text": "M | Halleluja, Halleluja, Halleluja, Halleluja",
					"instr": "",
					"alts": [],
					"optional": true
				},
				{
					"id": "l-32",
					"type": "tekst",
					"heading": "Tale",
					"text": "",
					"instr": "",
					"alts": [],
					"optional": true,
					"avslutningAlts": [
						{
							"label": "Lovprisning (full form)",
							"text": "L | Ære være Faderen og Sønnen og Den hellige ånd,\nsom var og er og blir én sann Gud fra evighet og til evighet."
						},
						{
							"label": "Lovprisning (kort form)",
							"text": "L | Ære være Faderen og Sønnen og Den hellige ånd: Vår skaper, frigjører og livgiver."
						}
					]
				},
				{
					"id": "l-33",
					"type": "tekst",
					"heading": "Trosbekjennelse Credo",
					"text": "",
					"instr": "",
					"alts": [
						{
							"label": "Den apostoliske trosbekjennelse",
							"text": "A | Jeg tror på Gud Fader, den allmektige, himmelens og jordens skaper.\nJeg tror på Jesus Kristus,\nGuds enbårne Sønn, vår Herre,\nsom ble unnfanget ved Den hellige ånd, født av jomfru Maria,\npint under Pontius Pilatus, korsfestet, død og begravet, fór ned til dødsriket,\nstod opp fra de døde tredje dag, fór opp til himmelen,\nsitter ved Guds, den allmektige Faders høyre hånd, skal derfra komme igjen\nfor å dømme levende og døde.\nJeg tror på Den hellige ånd, en hellig, allmenn kirke, de helliges samfunn, syndenes forlatelse, legemets oppstandelse\nog det evige liv.\nAmen."
						},
						{
							"label": "Den nikenske trosbekjennelse",
							"text": "A | Vi tror på én Gud, den allmektige Far,\nsom har skapt himmel og jord, alt synlig og usynlig.\nVi tror på én Herre, Jesus Kristus, Guds enbårne Sønn,\nfødt av Faderen før alle tider, Gud av Gud, lys av lys,\nsann Gud av sann Gud, født, ikke skapt,\nav samme vesen som Faderen. Ved ham er alt blitt skapt.\nFor oss mennesker og til vår frelse steg han ned fra himmelen,\nog ved Den hellige ånd og av jomfru Maria ble han menneske av kjøtt og blod.\nHan ble korsfestet for oss under Pontius Pilatus, led og ble begravet,\noppstod den tredje dag etter Skriftene og fór opp til himmelen,\nsitter ved Faderens høyre hånd, skal komme igjen i herlighet for å dømme levende og døde, og hans rike skal være uten ende.\nVi tror på Den hellige ånd, som er Herre og gjør levende,\nsom utgår fra Faderen og Sønnen,\ntilbes og æres sammen med Faderen og Sønnen, og som har talt gjennom profetene.\nVi tror på én hellig, allmenn og apostolisk kirke.\nVi bekjenner én dåp til syndenes forlatelse og venter de dødes oppstandelse\nog et liv i den kommende verden. Amen."
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
					"enabled": false
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
							"text": "ML/L | Vår Far i himmelen.\nTakk for at du skapte oss, og jorden vi bor på.\nTakk for at du kjenner og elsker oss alle.\nHjelp oss til å ta vare på hverandre\nog på alt det du har skapt.\nGud, vi ber.\nM | Menighetssvar\nML/L | Kjære Jesus.\nDu kom til jorden og ble menneske som oss.\nDu fant venner du kunne glede deg sammen med\nog gråte hos.\nTakk for evnen vår til vennskap.\nLa alle mennesker finne noen de kan stole på.\nDu har vist oss at hvert eneste menneske\ner viktig og verdifullt.\nVær hos alle som lider.\nLær oss å kjempe mot undertrykkelse og urett.\nGud, vi ber.\nM | Menighetssvar\nML/L | Gode hellige Ånd.\nDu har kalt oss til å være din kirke.\nKom til oss med dine gaver,\nså vi kan være lys og salt i verden.\nVis oss veien vi skal gå,\nog gi oss vilje og kraft til å gå den.\nGud, vi ber.\nM | Menighetssvar\nML/L | Bønnelapp på alteret...\nGud, vi ber.\nM | Menighetssvar"
						},
						{
							"label": "Menighetssvar: Herre, hør vår bønn.",
							"text": "M | Herre, hør vår bønn."
						},
						{
							"label": "Menighetssvar: Hør vår bønn. La ditt rike komme …",
							"text": "M | Hør vår bønn. Hør vår bønn. La ditt rike komme, la din vilje skje, Gud! Hør vår bønn."
						},
						{
							"label": "Menighetssvar: Herre, hør vår bønn. (sunget serie 3)",
							"text": "M | Herre, hør vår bønn."
						},
						{
							"label": "Menighetssvar: Herre, vår Gud, hør oss når vi ber.",
							"text": "M | Herre, vår Gud, hør oss når vi ber."
						}
					],
					"optional": false,
					"selAlt": 0,
					"introAlts": [
						{
							"label": "Innledning",
							"text": "ML/L | La oss be for kirken og verden."
						}
					]
				},
				{
					"id": "l-37",
					"type": "tekst",
					"heading": "Menighetssvar",
					"text": "M | Herre, hør vår bønn.\nEtter siste forbønn\nM | Herre, hør vår bønn.\nAmen.",
					"instr": "",
					"alts": [],
					"optional": true
				},
				{
					"id": "l-38",
					"type": "tekst",
					"heading": "Fadervår",
					"text": "A | Vår Far i himmelen.\nLa navnet ditt helliges.\nLa riket ditt komme.\nLa viljen din skje på jorden slik som i himmelen.\nGi oss i dag vårt daglige brød,\nog tilgi oss vår skyld,\nslik også vi tilgir våre skyldnere.\nOg la oss ikke komme i fristelse,\nmen frels oss fra det onde.\nFor riket er ditt,\nog makten og æren i evighet.\nAmen.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-39",
					"type": "tekst",
					"heading": "Takkoffer",
					"text": "L | Vi skal samle inn takkeofferet, det går i dag til ...\nTakkeoffer, det spilles instrumentalmusikk underveis\nL | Evige Gud, din er jorden og det som fyller den.\nAlt vi eier tilhører deg. Av ditt eget gir vi deg tilbake.\nA / L  Ta imot oss og våre gaver i Jesu navn. Amen.",
					"instr": "",
					"alts": [],
					"optional": true,
					"enabled": false
				},
				{
					"id": "l-40",
					"type": "instruks",
					"heading": "Takkeofferet i dag",
					"text": "I dag går takkeofferet til ...\nVippsnummer: 62 89 89  (Gyland)\nVippsnummer: 60 66 45  (Bakke)",
					"instr": "",
					"alts": [],
					"optional": true,
					"enabled": false
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
					"text": "L | Herren være med dere.\nM  reiser seg og synger Og med deg være Herren.\nL | Løft deres hjerter.\nM | Vi løfter våre hjerter til Herren.\nL | La oss takke Herren vår Gud.\nM | Det er verdig og rett.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-43",
					"type": "tekst",
					"heading": "Innledende lovprisning prefasjon",
					"text": "",
					"instr": "",
					"alts": [
						{
							"label": "Bakke og Gyland",
							"text": "I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som du sendte til frelse for verden, for at vi ved hans død skulle få tilgivelse for syndene og ved hans oppstandelse vinne det evige liv. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:"
						},
						{
							"label": "Nattverdbønn a (omarbeidet fra høymessen 1977)",
							"text": "PREFASJON | I sannhet verdig og rett er det at vi alltid og alle steder takker deg, allmektige Gud, evige Far, ved Jesus Kristus, vår Herre, han som du sendte til frelse for verden, for at vi ved hans død skulle få tilgivelse for syndene og ved hans oppstandelse vinne det evige liv. Ved ham lovsynger englene din herlighet, og din menighet i himmelen og på jorden priser ditt navn med samstemmig jubel. Med dem vil også vi forene våre røster og tilbedende synge:\nSANCTUS\nEPIKLESE | Vi priser deg, hellige Gud, himmelens og jordens Skaper, du som har elsket verden og gitt din Sønn, Jesus Kristus, for at han skulle frelse oss fra synd og død og vinne deg et hellig folk.\nL | Vi ber deg: Send din Ånd over disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen.\nVERBA | Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\nTROENS MYSTERIUM\nAVSLUTNING | Nådige Gud, vi feirer dette måltidet med glede og takk for din Sønns fullbrakte offer, i troen på hans seierrike oppstandelse og himmelfart og i forventning om hans gjenkomst i herlighet. Vi ber deg: Fyll oss med din Ånd og kjærlighet, så vi kan gjenkjenne Kristus i den som sulter og tørster. Lær oss å elske hverandre som han har elsket oss, og la oss en gang samles hos deg i ditt fullendte rike."
						},
						{
							"label": "Nattverdbønn b (etter Hippolyt, 200-tallet)",
							"text": "PREFASJON | Vi takker deg, Gud, ved din elskede Sønn Jesus Kristus. Han er det evige Ord, og ved dette Ord skapte du alt. Da tiden var inne, sendte du ham til verden som frelser og befrier. For dette priser vi deg, sammen med alle dine hellige i himmelen og på jorden:\nSANCTUS\nEPIKLESE | Vi priser deg Gud for Jesus Kristus, din tjener. Han kom fra himmelen, og ved Den hellige ånd og jomfru Maria ble han menneske av kjøtt og blod. Han oppfylte din vilje da han strakte ut sine hender på korsets tre. Slik tilintetgjorde han døden, brøt ondskapens lenker og åpenbarte oppstandelsen fra de døde. Derfor minnes vi hans død og oppstandelse når vi bærer brødet og vinen fram for deg.\nL | Vi ber deg: Send din hellige Ånd over disse gaver, så de for oss blir livets brød og frelsens beger.\nVERBA | Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\nTROENS MYSTERIUM\nAVSLUTNING | La alle som får del i brødet og vinen, forenes til ett. Fyll oss med din hellige Ånd og grunnfest oss i sannheten, så vi kan prise deg i din hellige kirke nå og i all evighet."
						},
						{
							"label": "Nattverdbønn c (paulinske tekster)",
							"text": "PREFASJON | Å, dyp av rikdom og visdom og kunnskap hos deg, Gud! Himlene forteller om din herlighet, og jorden vitner om dine henders verk. Sammen med de troende gjennom alle tider vil vi prise ditt hellige navn:\nSANCTUS\nEPIKLESE | Hellig og barmhjertig er du, Gud, som ikke vendte deg bort da mennesket syndet, men gav løfte til Abraham om velsignelse for alle folkeslag. Mektig og trofast er du, som befridde ditt folk fra trelldom, og fornyet løftene gjennom profetene.\nDa tiden var inne, sendte du din Sønn, født av Maria, for å kjøpe oss fri og gi oss retten til å være dine barn.\nVed hans død på korset forsonte du alt med deg selv og skapte fred, og ved hans oppstandelse ble døden overvunnet.\nL | Vi ber deg: Send din Ånd over disse dine gaver. Foren oss i troen på din nåde, så vi kan ta imot Jesu legeme og blod til forsoning og fred, og forkynne hans død til han kommer.\nVERBA | Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\nTROENS MYSTERIUM\nAVSLUTNING | Evige Gud, forny oss ved din Ånd. Sammen med alt som er skapt, venter vi med lengsel på å bli frigjort fra forgjengelighet og få del i den frihet som dine barn skal eie i herligheten. Fra deg og ved deg og til deg er alle ting. Deg være ære i all evighet!"
						},
						{
							"label": "Nattverdbønn d (Emmausfortellingen, Luk 24)",
							"text": "PREFASJON | Vi priser deg, evige Gud, du som har skapt verden og alt som er i den. Det er i deg vi lever, beveger oss og er til. Sammen med din menighet i himmelen og på jorden lovsynger vi ditt hellige navn:\nSANCTUS\nEPIKLESE | Vi takker deg, all godhets kilde. Du sendte din Sønn. Han ble korsfestet og stod opp fra de døde. Han åpnet skriftene og åpenbarte seg for sine venner da han brøt brødet og gav dem.\nL | Nå ber vi deg: La din hellige Ånd komme over brødet og vinen, så våre øyne åpnes, og vi kjenner ham igjen som vår korsfestede og oppstandne Frelser.\nVERBA | Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\nTROENS MYSTERIUM\nAVSLUTNING | Hellige Gud, fyll oss med din Ånd. Gi oss brennende hjerter, så vi i undring og glede tar vare på ditt ord og viser barmhjertighet mot den som lider. Bli hos oss, også når vi tviler og sørger. Gå med oss, inntil savn og smerte har veket for evig jubel og lovsang."
						},
						{
							"label": "Nattverdbønn e (bearbeidet etter familiemessen 2003)",
							"text": "PREFASJON | Vi takker deg, gode Gud, du som holder himmel og jord i dine hender. Du har skapt oss i ditt bilde og gitt oss livet i gave. Sammen med englene og din menighet i himmelen og på jorden lovsynger vi ditt hellige navn:\nSANCTUS\nEPIKLESE | Hellige Gud, vi takker deg for Jesus Kristus, verdens frelser. Han døde og stod opp igjen for å gi oss evig liv. Vi takker deg for dåpens gave, der vi blir født på ny, og for nattverden, der du samler oss som din store familie.\nL | Vi ber deg: Send din hellige Ånd over brødet og vinen. Gjør oss til ett med hverandre og med Jesus Kristus.\nVERBA | Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\nTROENS MYSTERIUM\nAVSLUTNING | Gud, fyll oss med din Ånd. Ta oss alle i favn, slik en kjærlig mor samler barna sine om seg. La de små bli opphøyet og de sultne bli mettet med gode gaver.\nLiturgen og/eller ett eller flere barn synger eller sier: Sammen med alle dine barn ber vi den bønn som din Sønn har lært oss:"
						},
						{
							"label": "Nattverdbønn f (kort – ved særskilte anledninger)",
							"text": "PREFASJON | Gode Gud, du har skapt oss og kalt oss ved navn. Du åpner din hånd og metter alt som lever med det gode. Sammen med din menighet i himmelen og på jorden lovsynger vi ditt hellige navn:\nSANCTUS\nEPIKLESE | Vi takker deg for Jesus Kristus, vår frelser. Han er det levende brød som kommer ned fra himmelen og gir verden liv.\nL | Vi ber deg: Send din Ånd over oss og disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen.\nVERBA | Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\nTROENS MYSTERIUM\nAVSLUTNING | Sammen med alle dine barn ber vi den bønn som din Sønn har lært oss:"
						},
						{
							"label": "Nattverdbønn g (Gudstjenesteboken 1992, Johannesordningen)",
							"text": "PREFASJON | Evige, allmektige Gud, du holder himmel og jord i dine hender, du nevner oss alle ved navn, så vi skal tilhøre deg og være ditt folk på jorden. Sammen med de troende gjennom alle tider og med de himmelske hærskarer vil vi prise ditt hellige navn:\nSANCTUS\nEPIKLESE | Hellige Gud, uten ende er din miskunn, og evig er ditt herredømme. Du har fylt ditt skaperverk med lys og liv; himmelen og jorden er fulle av din herlighet. Gjennom Abraham lovte du å velsigne alle folkeslag. Du berget Israel, ditt utvalgte folk. Gjennom profetene fornyet du ditt løfte. Og da tiden var kommet, sendte du din Sønn, han som i ord og gjerning forkynte ditt rike og var lydig mot din vilje helt til døden.\nL | Vi ber deg: Send din Ånd over disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen.\nVERBA | Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod, som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.\nL/ML | Derfor, så ofte som vi spiser dette brødet og drikker av begeret, forkynner vi Herrens død, inntil han kommer.\nTROENS MYSTERIUM\nAVSLUTNING | Derfor, barmhjertige Far, vil vi med dette brødet og dette begeret komme i hu at Herren gav sitt liv for oss. Og i troen på hans oppstandelse venter vi på at han kommer igjen i makt og herlighet og vil holde sitt store gjestebud sammen med sitt folk.\nA | Amen, ja, kom, Herre Jesus.\nL | Vi ber deg, allmektige Gud, gi oss din hellige Ånd. La oss kjenne kraften av Kristi oppstandelse, så vi som tar imot hans legeme og blod, kan leve til pris og ære for din herlighet og få del i den arven som de hellige får i lyset.\nA | Amen, ja, kom, du Hellige Ånd.\nL/ML | Foren vår bønn med bønnene fra dine tjenere alle steder og gjennom alle tider, og med forbønnen fra vår store øversteprest, som alltid ber for oss, inntil han kommer med seier, som Herren over alle ting. Ved ham og i ham og i samfunn med Den hellige ånd skal du ha all herlighet og ære, allmektige Far, evige Gud, nå og til evig tid."
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
					"alts": [],
					"optional": false
				},
				{
					"id": "l-45",
					"type": "tekst",
					"heading": "Påkallelse epiklese",
					"text": "L | Vi priser deg, hellige Gud, himmelens og jordens Skaper, du som har elsket verden og gitt din Sønn, Jesus Kristus,\nfor at han skulle frelse oss fra synd og død og vinne deg et hellig folk. Vi ber deg: Send din Ånd over disse gaver, så vi kan ta imot Jesus Kristus i brødet og vinen.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-46",
					"type": "tekst",
					"heading": "Innstiftelsesordene verba",
					"text": "L | Vår Herre Jesus Kristus, i den natt da han ble forrådt, tok han et brød, takket, brøt det, gav disiplene og sa: Ta imot og spis! Dette er min kropp som gis for dere. Gjør dette til minne om meg. Likeså tok han begeret etter måltidet, takket, ga dem og sa: Drikk alle av det! Dette beger er den nye pakt i mitt blod som utøses for dere så syndene blir tilgitt. Gjør dette så ofte som dere drikker det, til minne om meg.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-47",
					"type": "tekst",
					"heading": "Troens mysterium",
					"text": "L | Stort er troens mysterium.\nA | Kristus døde. Kristus stod opp. Kristus skal komme igjen.\nA | Ham være ære for kjærligheten som er sterkere enn døden.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-48",
					"type": "tekst",
					"heading": "Nattverdbønn",
					"text": "L | Nådige Gud, vi feirer dette måltid med glede og takk for din Sønns fullbrakte offer, i troen på hans seierrike oppstandelse og himmelfart og i forventning om hans gjenkomst i herlighet.\nVi ber deg: Fyll oss med din Ånd og kjærlighet, så vi kan gjenkjenne Kristus i den som sulter og tørster. Lær oss å elske hverandre som han har elsket oss, og la oss en gang samles hos deg i ditt fullendte rike.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-49",
					"type": "tekst",
					"heading": "Fadervår (nattverden)",
					"text": "A | Vår Far i himmelen.\nLa navnet ditt helliges.\nLa riket ditt komme.\nLa viljen din skje på jorden slik som i himmelen.\nGi oss i dag vårt daglige brød,\nog tilgi oss vår skyld,\nslik også vi tilgir våre skyldnere.\nOg la oss ikke komme i fristelse,\nmen frels oss fra det onde.\nFor riket er ditt,\nog makten og æren i evighet.\nAmen.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-50",
					"type": "tekst",
					"heading": "Fredshilsen pax",
					"text": "L | Guds fred være med dere.\nM | Guds fred være med deg.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-51",
					"type": "tekst",
					"heading": "Du Guds Lam agnus dei",
					"text": "",
					"instr": "",
					"alts": [
						{
							"label": "Bakke og Gyland",
							"text": "A  synger Du Guds Lam, som bærer verdens synder,\nmiskunne deg over oss.\nDu Guds Lam, som bærer verdens synder,\nmiskunne deg over oss.\nDu Guds Lam, som bærer verdens synder,\ngi oss din fred."
						},
						{
							"label": "Allmenn serie 1, 2, fest- og fasteserien",
							"text": "A | Du Guds Lam, som bærer verdens synder, miskunne deg over oss.\nDu Guds Lam, som bærer verdens synder, miskunne deg over oss.\nDu Guds Lam, som bærer verdens synder, gi oss din fred."
						},
						{
							"label": "Allmenn serie 3",
							"text": "ML | Amen, kom, Herre Jesus. A | Omkved: Amen, kom, Herre Jesus.\nML | Du er Lammet som bærer vår synd. A | Omkved\nML | Du er Lammet som gir oss din fred. A | Omkved\nML | Du er brødet som gir oss ditt liv. A | Omkved"
						}
					],
					"optional": false,
					"selAlt": 0
				},
				{
					"id": "l-52",
					"type": "tekst",
					"heading": "Utdeling",
					"text": "L | Når vi nå skal feire nattverd sammen, (ta beger og kom til alterringen/få brød og dypp i begeret).\nKom for alt er gjort ferdig.\nL | Kristi kropp, gitt for deg.\nML | Kristi blod, gitt for deg.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-53",
					"type": "tekst",
					"heading": "Fredsønske",
					"text": "L | Den korsfestede og oppstandne Jesus Kristus har nå gitt oss sin kropp og sitt blod som han gav til soning for alle våre synder.\nHan styrke oss og holde oss oppe i en sann tro til det evige liv.\nL | Fred være med dere.",
					"instr": "",
					"alts": [],
					"optional": true
				},
				{
					"id": "l-54",
					"type": "tekst",
					"heading": "Måltidets avslutning",
					"text": "",
					"instr": "",
					"alts": [
						{
							"label": "Bakke og Gyland",
							"text": "L | La oss takke og be.\nVi takker deg, himmelske Far, for dine velsignede gaver.\nVi ber deg at du ved disse gavene vil bevare oss i troen på deg, forene oss i din kjærlighet og stadfeste i oss håpet om det evige liv, for Jesu Kristi skyld.\nAmen"
						},
						{
							"label": "Takkebønn 1 (kan synges)",
							"text": "L/ML | Vi takker deg, himmelske Far, for dine velsignede gaver.\nVi ber deg at du ved disse gavene vil bevare oss i troen på deg, forene oss i din kjærlighet og stadfeste i oss håpet om det evige liv, for Jesu Kristi skyld.\nM | Amen."
						},
						{
							"label": "Takkebønn 2",
							"text": "L/ML | Vi takker deg, visdommens Gud, for ditt måltids dype hemmelighet: Brødet vi har brutt, er ett. Din Sønn har gitt sitt liv for én verden og én menneskehet. Vi ber:\nA/L/ML | Hjelp oss å høre det ropet du har hørt, å se den nøden du har sett, og å elske vår neste som oss selv."
						},
						{
							"label": "Takkebønn 3",
							"text": "L/ML | Vi takker deg, nådige Gud, du som gjennom brødet og vinen har gitt oss del i Jesu Kristi seierrike død og oppstandelse. Vi ber:\nA/L/ML | Styrk oss ved din Ånd til vitnesbyrd og tjeneste i verden."
						},
						{
							"label": "Takkebønn 4",
							"text": "L/ML | Trofaste Gud, du som i dåpen har gitt oss barnekår og gjort oss til arvinger i ditt rike. Vi takker deg for dette måltidet, hvor du har gitt oss syndenes forlatelse og fornyet i oss troen på dine løfter. Vi ber:\nA/L/ML | Styrk oss ved din Ånd til vitnesbyrd og tjeneste i verden."
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
					"optional": true
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
					"text": "L | La oss prise Herren.\nM | Gud være lovet. Halleluja. Halleluja. Halleluja.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-58",
					"type": "tekst",
					"heading": "Velsignelse",
					"text": "",
					"instr": "3x3 Bønneslag ved hver velsignelse.",
					"alts": [],
					"optional": false
				},
				{
					"id": "l-59",
					"type": "tekst",
					"heading": "Utsendelse",
					"text": "",
					"instr": "",
					"alts": [
						{
							"label": "Bakke og Gyland",
							"text": "L / LM  Gå i fred. Tjen Herren med glede."
						},
						{
							"label": "La oss gå i fred",
							"text": "L/ML | La oss gå i fred,\nA | i Jesu Kristi navn."
						},
						{
							"label": "Gå i fred. Tjen Herren med glede.",
							"text": "L/ML | Gå i fred. Tjen Herren med glede."
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
	]
},
{
	"id": "gravferd-2003",
	"builtinKey": "gravferd-2003",
	"kind": "template",
	"liturgiType": "gravferd",
	"name": "Ordning for gravferd (bokmål, 2003)",
	"description": "Ordning for gravferd fra kirke eller krematorium — vedtatt av Kirkemøtet 2002, med alle alternativer og skriftlesningstekstgrupper.",
	"sections": [
		{
			"title": "Gravferd fra kirke eller krematorium",
			"items": [
				{
					"id": "gf-1",
					"type": "instruks",
					"heading": "1 Klokkeringing",
					"text": "",
					"instr": "Mens det ringes sammen, tar liturgen plass i koret.",
					"alts": [],
					"optional": true
				},
				{
					"id": "gf-2",
					"type": "instruks",
					"heading": "2 Preludium",
					"text": "",
					"instr": "Som preludium kan det fremføres egnet instrumentalmusikk, korsang eller solosang. Preludiet kan være forspill til første salme.",
					"alts": [],
					"optional": true
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
					"text": "{{r}}L |{{/r}} Nåde være med dere og fred fra Gud vår Far og Herren Jesus Kristus.\nVi er samlet her for å ta avskjed med (navnet nevnes).\n*Sammen vil vi overgi ham/henne i Guds hender [og følge ham/henne til det siste hvilestedet].*",
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
					"selAlt": 0
				},
				{
					"id": "gf-5",
					"type": "tekst",
					"heading": "5 Inngangsbønn",
					"text": "{{r}}L |{{/r}} La oss be.",
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
					"optional": false
				},
				{
					"id": "gf-6",
					"type": "tekst",
					"heading": "6 Minneord",
					"text": "",
					"instr": "Et kort minneord holdes av liturgen eller av en representant for de pårørende. Det bør inneholde noen biografiske momenter med særlig vekt på hva avdødes liv har betydd for dem som stod ham/henne nær, og for andre livssammenhenger han/hun har stått i.\nHer kan følge korte hilsninger, pålegging av blomster og/eller krans og eventuelt andre minnehandlinger, som opplesning, musikk, lystenning o. a.",
					"alts": [],
					"optional": true
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
					"text": "{{r}}L |{{/r}} La oss høre hva Guds ord vitner om livet og døden, og dommen og vårt håp i Jesus Kristus.\n\n(Her følger tre lesninger — se tekstgruppene til slutt i ordningen. Tekstene velges slik at de dekker de innholdsmomenter som er nevnt foran. Menigheten sitter under lesningen. Tekstene kan leses av liturgen eller av en eller flere andre.)\n\nSkriftlesningen avsluttes med:\n{{r}}L |{{/r}} Slik lyder Herrens ord.",
					"instr": "",
					"alts": [],
					"optional": false
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
							"text": "Jeg vet at min gjenløser lever. Som den siste skal han stå fram i støvet.\nNår huden er revet av meg og kjøttet er borte, skal jeg se Gud.\nMine øyne ser, det er jeg som får se ham, ikke en fremmed.\nJob 19,25-27a.[27b]"
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
					"optional": false
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
					"optional": false
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
					"optional": false
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
						}
					],
					"optional": false
				}
			]
		},
		{
			"title": "Gravferd fra kirke eller krematorium (fortsettelse)",
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
					"optional": true
				},
				{
					"id": "gf-11",
					"type": "tekst",
					"heading": "11 Bønn",
					"text": "{{r}}L |{{/r}} La oss be.",
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
					"optional": false
				},
				{
					"id": "gf-12",
					"type": "tekst",
					"heading": "12 I dine hender",
					"text": "{{r}}A |{{/r}} I dine hender, Herre Gud, overgir jeg min ånd. Du forløser meg, Herre, du trofaste Gud.\n\nI dine hender, Herre Gud, overgir jeg min ånd. Ære være Faderen og Sønnen og Den hellige ånd. I dine hender, Herre Gud, overgir jeg min ånd.",
					"instr": "Dette leddet kan også synges som vekselsang, se Norsk salmebok 2013 nr 941.1 og 2. Her kan også følge Simeons lovsang (Luk 2,29-32), enten lest eller sunget, se Norsk salmebok 2013 nr 908 og 909.",
					"alts": [],
					"optional": false
				},
				{
					"id": "gf-13",
					"type": "tekst",
					"heading": "13 Fader vår",
					"text": "{{r}}L |{{/r}} La oss sammen be Fader vår.",
					"instr": "",
					"alts": [
						{
							"label": "Vekselsang",
							"text": "{{r}}A |{{/r}} Vår Far i himmelen!\n{{r}}A |{{/r}} La navnet ditt helliges.\n{{r}}A |{{/r}} La riket ditt komme.\n{{r}}A |{{/r}} La viljen din skje på jorden slik som i himmelen.\n{{r}}A |{{/r}} Gi oss i dag vårt daglige brød,\n{{r}}A |{{/r}} og tilgi oss vår skyld, slik også vi tilgir våre skyldnere.\n{{r}}A |{{/r}} Og la oss ikke komme i fristelse, men frels oss fra det onde.\n{{r}}A |{{/r}} For riket er ditt, og makten og æren i evighet.\n{{r}}A |{{/r}} Amen."
						},
						{
							"label": "Lest",
							"text": "{{r}}A |{{/r}} Fader vår, du som er i himmelen!\nLa ditt navn holdes hellig.\nLa ditt rike komme.\nLa din vilje skje på jorden som i himmelen.\nGi oss i dag vårt daglige brød.\nForlat oss var skyld, som vi og forlater våre skyldnere.\nLed oss ikke inn i fristelse, men frels oss fra det onde.\nFor riket er ditt, og makten og æren i evighet.\nAmen."
						}
					],
					"optional": false
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
					"optional": true
				}
			]
		},
		{
			"title": "Jordpåkastelse — ved graven",
			"items": [
				{
					"id": "gf-16",
					"type": "instruks",
					"heading": "Jordpåkastelse — ved graven",
					"text": "",
					"instr": "Før ledd 16 Salme plasseres kisten på senkeapparatet eller på planker o.l. over graven og blir stående der inntil ledd 19 Senkning finner sted.\nHvor det er praksis, kan kisten senkes helt ned i graven med en gang før salmen (ledd 16) synges.",
					"alts": [],
					"optional": true
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
						}
					],
					"optional": false
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
					"optional": false
				},
				{
					"id": "gf-20",
					"type": "instruks",
					"heading": "19 Senkning",
					"text": "",
					"instr": "Som hovedregel senkes kisten helt ned.",
					"alts": [],
					"optional": true
				},
				{
					"id": "gf-21",
					"type": "tekst",
					"heading": "20 Jordpåkastelse",
					"text": "{{r}}P |{{/r}} I Faderens og Sønnens og Den Hellige Ånds navn.\n\nDeretter kaster liturgen tre ganger jord på kisten og sier:\nFørste gang: Av jord er du kommet.\nAndre gang: Til jord skal du bli.\nTredje gang: Av jorden skal du igjen oppstå.",
					"instr": "",
					"alts": [],
					"optional": false
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
					]
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
			]
		},
		{
			"title": "Jordpåkastelse — i krematorium",
			"items": [
				{
					"id": "gf-25",
					"type": "instruks",
					"heading": "Jordpåkastelse — i krematorium",
					"text": "",
					"instr": "Gravferdshandlingen ovenfor (ledd 1–13) avsluttes med jordpåkastelse (ledd 19–23). Rent unntaksvis kan denne ordningen følges også i kirke/kapell, se Alminnelige bestemmelser punkt 8.",
					"alts": [],
					"optional": true
				},
				{
					"id": "gf-26",
					"type": "instruks",
					"heading": "19 Senkning (krematorium)",
					"text": "",
					"instr": "I rom hvor senkning ikke er praktisk mulig, bør kisten føres bort under postludiet.",
					"alts": [],
					"optional": true
				},
				{
					"id": "gf-27",
					"type": "tekst",
					"heading": "20 Jordpåkastelse (krematorium)",
					"text": "{{r}}L |{{/r}} I Faderens og Sønnens og Den Hellige Ånds navn.\n\nDeretter kaster liturgen tre ganger jord på kisten og sier:\nFørste gang: Av jord er du kommet.\nAndre gang: Til jord skal du bli.\nTredje gang: Av jorden skal du igjen oppstå.",
					"instr": "",
					"alts": [],
					"optional": false
				},
				{
					"id": "gf-28",
					"type": "tekst",
					"heading": "21 Skriftord og velsignelse (krematorium)",
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
					]
				},
				{
					"id": "gf-30",
					"type": "salme",
					"heading": "22 Salme (krematorium)",
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
					"heading": "23 Postludium (krematorium)",
					"text": "",
					"instr": "I rom hvor senkning ikke er praktisk mulig, bør kisten føres bort under postludiet.",
					"alts": [],
					"optional": true
				}
			]
		}
	]
}
];
