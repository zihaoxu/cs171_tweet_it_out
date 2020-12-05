let sentiment_clusters = {
    "en": {
        "titles": ["Sentiment analysis on Covid-19 tweets | Significant tweet topics to sentiment mapping"],
        "categories": [
            { id: "sentiment_cluster_1", label: "Negative Sentiment 80-90"},
            { id: "sentiment_cluster_2", label: "Negative Sentiment 70-80"},
            { id: "sentiment_cluster_4", label: "Positive Sentiment 60-70"},
            { id: "sentiment_cluster_3", label: "Negative Sentiment 60-70"},
            { id: "sentiment_cluster_5", label: "Negative Sentiment 90-100"},
            { id: "sentiment_cluster_6", label: "Positive Sentiment: 70-80"},
            { id: "sentiment_cluster_7", label: "Positive Sentiment: 80-90"},
            { id: "sentiment_cluster_8", label: "Positive Sentiment: 90-100"},
            { id: "sentiment_cluster_9", label: "Positive <=50 Negative <=60"},
        ],
        "definitions": [
            { id: "tweet_full_text_1", definition: "@JrPardal1 @zipelCS @Epidemic unbelievable neat bro"},
            { id: "tweet_full_text_2", definition: "FL and NY have an identical number of per capita coronavirus infections but FL has 5X less per capita deaths. Will Dr. Fauci be praising @GovRonDeSantis√¢¬Ä¬ô response to the pandemic?  Will he point out that @NYGovCuomo√¢¬Ä¬ôs response allowed a fivefold greater per capita death rate?"},
            { id: "tweet_full_text_3", definition: "Now that the weekend of distractions is over, a quick reminder that DONALD TRUMP IS LETTING THE RUSSIANS KILL AMERICAN SOLDIERS AND LETTING CORONAVIRUS KILL AMERICANS.  HE DOES NOT WANT YOU TO TALK ABOUT THIS.   Please, do not RT!!!!! "},
            { id: "tweet_full_text_4", definition: "Since 16th July there have been 0 (yes, zero) COVID deaths in Scotland, 700 in England. There have been 170 recorded new infections in Scotland, 7559 in England. One reason for the difference is good clear consistent messaging. Stick with it! There's still a pandemic going on."},
            { id: "tweet_full_text_5", definition: "My video today warned of virus born economic crash &amp; QE4EVA (https://t.co/EBIGuf10cx). Well QE5.0 is here. On cue, Reuters reports billions in Chinese Virus Bonds issued in days, state subsidized, w/ proceeds that don't need to be spent on virus issues https://t.co/u1LgkqzZHR "},
            { id: "tweet_full_text_6", definition: "renewable energy could emerge on top after the pandemic. #COVID19 #RebuildBetter"},
            { id: "tweet_full_text_1114", definition: "Trump pressured the @US_FDA to approve a COVID-19 treatment before it's been fully reviewed. This isn√¢¬Ä¬ôt cutting red tape √¢¬Ä¬ì it√¢¬Ä¬ôs strong-arming public health experts for the President's political purposes. FDA actions must be based on science, not politics. https://t.co/1mBlco31yi\n"},
            { id: "tweet_full_text_1118", definition: "√∞¬ü¬ö¬®Trump says he√¢¬Ä¬ôs blocking Postal Service funding because Democrats want to expand mail-in voting during pandemic -  https://t.co/ndStktUdWY"},
            { id: "tweet_full_text_1127", definition: "TW: Homophobia Let's not forget how the Church Education System Gaslighted the entire LGBTQ+ student population at their schools. COVID may have taken us off campus, but we didn't forget https://t.co/pQM4Mau2M1"},
            { id: "tweet_full_text_1132", definition: "As the coronavirus pandemic causes unemployment to soar among young people in France, those in struggling neighborhoods could be hardest hit https://t.co/UYe6z36tIE "},
            { id: "tweet_full_text_1207", definition: "Sydney Talker tested positive for Coronavirus and recovered in less than 48 hours, the fastest recovery from the virus ever recorded. Why are we not talking about this landmark achievement?"},
            { id: "tweet_full_text_1212", definition: "A Dallas flight lands at 7:35am in Dublin Airport tomorrow morning. On Tuesday Texas set a US state record with 10,000 new #COVID__19 cases Of the 23 new cases confirmed today here, 15 were travel related https://t.co/19qfyktDeV"},
            { id: "tweet_full_text_1213", definition: "Angola is Committed To Meeting #Energy Objectives Amid COVID-19"},
            { id: "tweet_full_text_1215", definition: "Why did the president knowingly mislead America about the coronavirus threat?"},
            { id: "tweet_full_text_1235", definition: "\"CHRIS WALLACE: You're saying Trump didn't want to panic people about Covid. But he plays the panic card about Biden all the time. Is that a POTUS who's trying to keep the country calm?\n" +
                    "TRUMP ADVISER STEVE CORTES: There's a difference. With Biden, there's a legitimate fear. https://t.co/Dgk9OJf1Fh\""},
            { id: "tweet_full_text_1236", definition: "\"Edmonton Health Zone COVID-19 Update:\n" +
                    "(June 1st-June 12th)\n" +
                    "Tests Conducted: 16,872\n" +
                    "Positive Tests: 131\n" +
                    "Positive Test %: 0.78%\n" +
                    "Currently In Hospital: 9\n" +
                    "Currently In ICU: 2\n" +
                    "Deaths: 0 (1 death since May 1st) "},
            { id: "tweet_full_text_1238", definition: "Corona virus cannot stop 'Vikas'! Indian Railways sets up solar power plant in Madhya Pradesh to run trains! This is special bcoz till date no country in the world used solar power to run trains! Indian minds are travelling in bullet speed!"},
            //         { id: "tweet_full_text_1239", definition: "Destructive natural events affecting the lives and living conditions of local communities and their  possibilities to practice their intangible heritage"},
            { id: "tweet_full_text_1240", definition: "Students are being suspended for taking pictures of schools that aren√¢¬Ä¬ôt following coronavirus safety protocols. Hopefully they don√¢¬Ä¬ôt stop until every student is suspended and safe at home."},
            { id: "tweet_full_text_1241", definition: "NEW: CDC Director Redfield to US Senate cmte.: facemasks are the important, powerful public health tool we have ... I might even go so far as to say that this facemask is more guaranteed to protect me against COVID than when I take a COVID vaccine.√¢¬Ä¬ù https://t.co/7LJZ3U9xi1\""},
            { id: "tweet_full_text_1242", definition: "\"Edmonton Health Zone COVID-19 Update:\n" +
                    "(June 1st-June 12th)\n" +
                    "Tests Conducted: 16,872\n" +
                    "Positive Tests: 131\n" +
                    "Positive Test %: 0.78%\n" +
                    "Currently In Hospital: 9\n" +
                    "Currently In ICU: 2\n" +
                    "Deaths: 0 (1 death since May 1st)"},
            { id: "tweet_full_text_1243", definition: "Black, female doctor: I have treated 350 patients with a drug cocktail including hydroxychloroquine. None died."},
            { id: "tweet_full_text_1244", definition: "6 Trump staffers just tested positive for Covid.\n" +
                    "Have fun inside a hot, humid, packed, arena filled with fans screaming their pork rind and flat beer breath on each other, while listening to an orange Sociopath making shit up..."},
            { id: "tweet_full_text_1245", definition: "This lil pandemic made me realize I need to start living life fr, I don√¢¬Ä¬ôt be on nun.."},
            { id: "tweet_full_text_1246", definition: "Dr Birx is delivering much needed reprimand to fear mongers pushing doomsday scenario statistics about COVID-19 (which originated @ Imperial College UK). She is debunking fake news narratives about COVID-19 being \"plague of century.\" Much needed sober analysis coming from her.\n"},
            { id: "tweet_full_text_1289", definition: "The South Korean pharmaceutical company backed by Bill Gates may be capable of producing 200 million coronavirus vaccine kits by next June, the Microsoft co-founder said https://t.co/tAmZa5x1Ws\n" +
                    "\"Next time when you Vote, Bill Gates for President !!"},
            { id: "tweet_full_text_1291", definition: "Yet @GovAbbott is sticking with reopening - on Friday reopened amusement parks - and doing nothing to stop the spread. \n"},
            { id: "tweet_full_text_1293", definition: "Katy Perry is the only artist that constantly serving us virtual technology, visually appealing video performances, budgeted livestream events amidst the pandemic. Put some respect on a hardworking pregnant pop superstar! https://t.co/VJWULHwHtA\n "},
            { id: "tweet_full_text_1294", definition: "The world√¢¬Ä¬ôs deadliest animal hasn't taken a break during this pandemic. Important reminder from @BillGates on why we mustn't lose sight of our efforts to rid the world of preventable, treatable diseases like malaria: https://t.co/gI3k5HkkZN "},
            { id: "tweet_full_text_1295", definition: "May Allah protect us all from the coronavirus."},
            { id: "tweet_full_text_1296", definition: "Dah 50 kes positif Coronavirus di Malaysia. Please stay safe guys. Avoid unnecessary travel."},
            { id: "tweet_full_text_1297", definition: "BREAKING: India reports 78,761 new coronavirus cases, the biggest daily figure anywhere in the world since the pandemic began."},
            { id: "tweet_full_text_1299", definition: "Stop harassing employees working at private businesses who updated their \"No Shirt No Service\" policies to include \"No Mask\" during the pandemic that is still ongoing. They are doing it to protect you and everyone else. There is no global conspiracy other than in your own head.\n"},
            { id: "tweet_full_text_1300", definition: "It√¢¬Ä¬ôs no accident that the same day DJT declares the troops are coming home and gets a Nobel nom for his work in foreign policy, the media recycles old stories on state level incompetence regarding Covid that anyone with an entry level understanding of Federalism can demolish."},
            { id: "tweet_full_text_1301", definition: "I am voting for @JoeBiden &amp; @KamalaHarris.  I Want to make sure our veterans &amp; other will get to vote!!!  Todays reminder DONALD TRUMP IS LETTING THE RUSSIANS KILL AMERICAN SOLDIERS AND LETTING CORONAVIRUS KILL AMERICANS. HE DOES NOT WANT YOU TO TALK ABOUT THIS. We Wont forget!!! https://t.co/81j3r7o4An"},
            { id: "tweet_full_text_1303", definition: "Victoria posts deadliest day, but confident coronavirus easing @AJENews  https://t.co/4YFGbRXLrr"},
            { id: "tweet_full_text_1304", definition: "Military Hospital, #Jodhpur #KonarkCorps, commissions its Maiden Molecular Biology Laboratory. The laboratory is authorised by #ICMR to conduct both Rapid Antigen test and confirmatory RT PCR tests for the diagnosis of COVID-19.\n" +
                    " \n" +
                    "#NationFirst\n" +
                    "#IndianArmy https://t.co/HKueitqmPG\""},
            { id: "tweet_full_text_1305", definition: "Significant influx of people perceived by local communities as detrimental to the viability of their intangible heritage"},
            { id: "tweet_full_text_1306", definition: "Corrupts have no way !! Honest effort still finds light"},
            { id: "tweet_full_text_1307", definition: "NEW: Trump's reelection campaign is waging a multistate, multimillion-dollar legal battle against mail-in voting during the pandemic. A deep dive into how the campaign's unusually active litigation strategy is playing out in court so far: https://t.co/lItI7VKBRB"},
            { id: "tweet_full_text_1308", definition: "Massive introduction of digital media, internet, mobile phones, etc.  diminishing the time available for and the interest in the intangible heritage of one's community"},
            { id: "tweet_full_text_1310", definition: "Prime Minister Shri Narendra Modi will be launching high throughput COVID-19 testing facilities on 27th July via video conferencing, ramping up testing capacity in the country. https://t.co/mmf79Hkdo4"},
            { id: "tweet_full_text_1312", definition: "Use of modern materials in traditional processes leading to the loss of integrity in the eyes of (some) community members"},
            { id: "tweet_full_text_1313", definition: "Trudeau: Canada handled coronavirus better than many countries, 'including our neighbor' https://t.co/7CeWFPw495"},
            { id: "tweet_full_text_1314", definition: "\"@Perrygr68 @Yamiche They treat him the way they do, I think, for 2 different reasons:\n" +
                    "-ratings (e.g. airing his Covid-19 press briefings so he could gaslight all of us) \n" +
                    "-fear of being bullied by him (e.g. how the NY Times has spread articles to \"\"show both sides\"\" and \"\"help us better understand them\"\"\""},
        ]
    }
}