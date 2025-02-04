Bevezetés

Kutatásom fő célja egy megfelelő RL (megerősítéses tanulás) könyvtár megtalálása a játékomhoz. A társas rendelkezik egy beépített mesterséges intelligencia (továbbiakban MI) ellenféllel, ami a szerver oldalon helyezkedik el. {írni róla, hogy mi is az MI hogyan tanul stb. + magában a játékban miket kell ellátnia, tudnia az AI-nak} A terveim szerint az MI megerősítéses tanulás (RL - reinforcement learning) által fejleszti önmagát. Ehhez próbálok a továbbiakban megfelelő ötleteket, könyvtárakat, segítséget találni. 

Tensorflow.js RL

A TensorFlow.js egy olyan gépi tanulásos könyvtár, ami JavaScript nyelven alapul. A segítségével futtathatunk meglévő modelleket, újra taníthatjuk őket, vagy akár írhatunk sajátokat is JavaScript használatával. A meglévő modelleket futtathatjuk webes, illetve böngészőalapú alkalmazásainkban és Node.js környezetben különböző feladatok megoldásához. Ilyen feladatok például a képosztályozás, arc- és tárgyfelismerés vagy különböző nyelvi kérdések megválaszolása. Ezek által kiváló megoldást jelenthet webalapú játékok esetén is. 
Meglévő modell újratanítása a társasjátékom esetében nem opció, mivel a megerősítéses tanuláson alapuló modellek általában specifikus feladatokhoz készülnek, ezért egy meglévő modell alkalmazása a játékomban nem feltétlenül eredményes. A különböző játékokban eltérő környezetekkel és döntési struktúrákkal találkozunk, amelyek miatt egy előre betanított modell aligha illeszkedne jól a játékom szabályaihoz. 
A TensorFlow.js-en belüli RL használata meglehetősen bonyolult lenne, mivel jelenleg nem érhető el kifejezetten az RL-nek dedikált könyvtár, mint például a Python-alapú TensorFlow tf-agents csomagja. A TensorFlow.js lehetővé teszi a gépi tanulási modellek JavaScript-ben való használatát, azonban RL specifikus implementációkat nem biztosít.  

https://www.tensorflow.org/js/tutorials#convert_pretained_models_to_tensorflowjs
https://www.tensorflow.org/js/tutorials/conversion/import_keras
https://www.tensorflow.org/js/tutorials/conversion/import_saved_model

Python RL

Általánosan egy megerősítéses tanulást alkalmazó keretrendszer olyan ügynököket használ, amelyek célja egy virtuális környezetben való optimalizált döntéshozás. A döntéshozatal mellett tanulnak az elvégzett akciók és a velük járó jutalmak közötti kapcsolatokból, ezáltal fejlesztve a jövőbeli optimális döntéshozatalukat. Az ügynök és a környezet folyamatosan interaktál egymással. Az ügynök hoz egy döntést a jelenlegi környezeti állapotban a saját policy-je (döntési stratégiája) alapján, majd kap egy jutalmat és a következő állapotát a környezetnek. A cél a policy fejlesztése, hogy a jutalmak összege a lehető legmagasabb legyen. Ezek megvalósításához ideális megoldást nyújt a TensorFlow, mivel a megerősítéses tanulás alkalmazására kínál egy Agents (Ügynökök) nevezetű könyvtárat, amely megkönnyíti az új megerősítéses tanulásos algoritmusok tervezését, implementálását és tesztelését. A könyvtár jól tesztelt, moduláris komponenseket biztosít, amelyeket kedvünk szerint módosíthatunk, bővíthetünk. 
A könyvtár által kínált ügynökök például lehetnek: DQN, REINFORCE, DDPG, TD3, PPO, SAC.

Mielőtt továbbmegyünk, vizsgáljunk meg egy fontos kérdést a megfelelő ügynök kiválasztása előtt. A gépi tanulásban fontos fogalmak a diszkrét, illetve folytonos akcióterek. Ezek nem mást, mint a döntési lehetőségek típusát jelzik. Egy diszkrét akciótérben (discrete action space) az ügynök egy véges, meghatározott számú akció közül választhat, például mozoghat jobbra, balra, fel vagy le egy rácson. Jól alkalmazható olyan játékoknál, ahol a lépések száma korlátozott, mint a sakknál. A folytonos akciótérben (continuous action space) az ügynök tetszőleges, folytonos értékeket választhat egy adott tartományban, például gyorsulási fokot vagy kormányzási szöget egy autós szimulációban. Az én játékomat tekintve az ügynök meghatározott lehetőséggel rendelkezik: kiválaszthatja, hogy melyik területre helyez seregeket, honnan támad és mennyi sereggel, stb. Míg a sereg mennyiségének kiválasztása közelíthet a folytonos akciótérhez, a lépések száma és jellege jól leírható diszkrét döntési lehetőségekkel, így feltehetőleg a diszkrét módszerek (például DQN vagy PPO) megfelelőek lesznek.

Mind a DQN (Deep Q-Network - Mély Q-Hálózat), és a Q-tanulás a megerősítéses tanulás módszerei közé tartozik. A Q-tanulás egy algoritmus, ahol az ügynök rendel egy úgynevezett Q-értéket minden lehetséges állapot-akció pároshoz. Minden lépésnél az algoritmus frissíti ezeket az értékeket annak alapján, hogy az adott akcióért milyen jutalmat kapott. A cél az, hogy az ügynök a lehető legjobb, azaz a legnagyobb Q-értékkel rendelkező akciót válassza, ezáltal optimalizálva a hosszútávú döntéseit. A Q-tanulás segítségével az ügynök lépésről lépésre, iteratívan fejleszti a meghozott döntéseit, amíg el nem éri a maximális értékű (optimális) stratégiájának kifejlesztését. Ezen gondolatot kiegészítve, a DQN továbbfejleszti a hagyományos Q-tanulást mély neurális hálózatok alkalmazásával. Míg egy Q-tanulást alkalmazó ügynök táblázatot használ az egyes állapot-akció párok Q-értékeinek tárolására, a DQN egy mély neurális hálózatot használ a Q-függvény megközelítésére. Ezáltal az ügynöknek lehetősége nyílik olyan komplexebb környezetekben is hatékonyan tanulni, ahol egyébként a lehetséges állapotok száma túl nagy lenne egy hagyományos Q-tanulás táblázatos megoldásának. A DQN tanulási folyamata során az ügynök folyamatosan frissíti a neurális hálózatának súlyait annak érdekében, hogy minél pontosabban megjósolja az egyes akciók hosszú távú jutalmát. Kijelenthetjük, hogy mindkét módszer célja az ügynöknek egy optimális döntéshozó képesség kifejlesztése, azonban a DQN ideálisabb megoldást nyújt egy komplex, sok állapottal rendelkező környezetben. Mivel a DQN mély neurális hálózatot használ a Q-értékek kiszámításához, azaz nem kell minden egyes állapot-akció párról egyedi adatot tárolni, ezért egy hatékonyabb, skálázhatóbb megoldást jelent a projektem számára, ezért ezen a szálon haladok tovább a kutatásomban. 

A többi ügynököt vizsgálva még a PPO (Proximal Policy Optimization) eshet számításba, ugyanis a többi a folytonos akcióterekben nyújt megoldást. A PPO Policy-alapú tanulást alkalmaz, úgynevezett policy-kat (döntési szabályokat) fejleszt. Ezek a policy-k megmondják az ügynöknek, hogy milyen lépést válasszon az adott helyzetben. Célja, hogy egy stabil, könnyen beállítható módszert biztosítson a tanuláshoz, korlátozva a policy változásának mértékét, így megelőzve a gyakori, instabil lépésváltozásokat. Eme korlátozás eléréséhez az úgynevezett "clipping" mechanizmust alkalmazza, amely biztosítja, hogy a policy frissítése ne legyen túl nagy egy adott irányban. Ha a változás mértéke meghalad egy bizonyos küszöböt, a klip hatására a policy frissítés elutasítja az optimális szintet meghaladó változásokat így megakadályozva a túltanulást, instabilitást. 

Interfacing

Mivel a szerverem JavaScript nyelven íródott, illetve az MI Python nyelven kerül megvalósításra, valahogyan meg kell oldanom, hogy a kettő tudjon kommunikálni egymással. Az egyik megoldás a Python alkalmazáson belül egy REST API létrehozása (például Flask keretrendszerrel), ahol a Node.js szerver HTTP-kéréseket küldene, és a Python API pedig visszaadná az eredményeket. Ezzel a megoldással az a probléma, hogy nem valós idejű kommunikációra optimalizált. Ezzel szemben egy hatékonyabb megoldást nyújthat egy WesSocket kapcsolat. A Python és a Node.js között egy kétirányú, valós idejű kommunikációt biztosíthatunk a segítségével. Ez egy aszinkron adatcserét eredményez, ami hosszabb adatok küldésére és fogadására a legoptimálisabb. Egy harmadik megoldás lehet a JSPyBridge könyvtár használata. A segítségével egy közvetlen kapcsolatot teremthetünk Node.js és Python között, lehetővé téve a Python kódfuttatást Node.js-ből és fordítva. A játékom esetében főként döntési adatok küldése és nem tömeges adatcsere zajlik, ezért a JSPyBridge bizonyul gyorsabb megoldásnak, mivel szinkron módon hívja a Python függvényeket. 

Konklúzió

A továbbiakban a Python alapú TensorFlow Agents könyvtárán belüli DQN ügynök segítségével kezdem el fejleszteni a projektemhez tartozó mesterséges intelligenciát. Az MI a JSPyBridge segítségével fog kommunikálni a szerverrel. 

Források:
https://www.tensorflow.org/js
https://www.tensorflow.org/js/models
https://www.tensorflow.org/agents
https://www.tensorflow.org/agents/tutorials/0_intro_rl
https://medium.com/@corinacataraug/hybrid-action-spaces-in-rl-a-short-overview-5314ac0d62d6
https://www.mathworks.com/help/reinforcement-learning/ug/proximal-policy-optimization-agents.html
https://github.com/extremeheat/JSPyBridge
https://blog.logrocket.com/exploring-jspybridge-library-python-javascript/

Note a python-hoz:
https://www.python.org/downloads/
3.11-es verziót!
letöltésnél pipa a path és a másikhoz is
cd az ML mappába
python -m venv venv
.\venv\Scripts\activate
pip install --upgrade pip
pip install numpy pandas scikit-learn tensorflow keras
pip list

Környezet:
https://medium.com/@paulswenson2/an-introduction-to-building-custom-reinforcement-learning-environment-using-openai-gym-d8a5e7cf07ea
kérdések hozzá:
    - kétszemélyes a játék, mikor adjunk át új állapotot? támadás után egyből, vagy ha a másik játékos is végzett a támadásaival?
    - a lehetséges állapotok folyton változnak? hogyan kell megoldani?
    - ha a másik játékos körében van vége a játéknak, akkor arról hogyan értesítjük? pláne ha nyert az ai..
    - a környezet specifikus egy ügynökhöz? azaz ha később lesz egy második ügynök is, akkor ő ugyan ezt fogja haszálni?

A támadási környezetnek tehát a következőket kell tudnia:
Kezelni a dinamikusan változó állapotokat és akcióteret.
Biztosítani a kommunikációt a szerverrel.
Visszajelzést adni az AI-nak a döntései következményeiről (jutalmak és állapotfrissítések formájában).
class BasicEnv(Env):
    __init__(self):
        pass
    
    step(self, action):
        pass
    reset(self):
        pass
    render(self):
        pass

GameState numerikus formában:
    -területek birtoklása: 
        ° 1: AI birtokolja
        ° 0: nem AI birtokolja
    -seregek száma (0 és 1 közé essen):
        ° seregek száma osztva egy max értékkel (pl.: 100, lehet kevesebb is, akkor szerver oldalon ezt maximalizálni kell)
    -szomszédok (mártix):
        ° 1: szomszédos
        ° 0: nem szomszédos
    -támadhatunk-e a területről:
        ° 1: támadhatunk
        ° 0: nem támadhatunk (már támadtunk, nincs szomszédos ellenség vagy nincs elég sereg)
    -két állapot:
        ° is_my_turn: Az AI player van-e soron
        ° round_state: kör melyik része van (1: támadás, 0: bármi más)

Megj.:
Első megközelítésben legyen az AI a Ghiscari ház!
Az AI egyelőre csak szomszédos területekre tud támadni, nem tudja, hogy a kikötőkbe is lehet!
A biztonság kedvéért szerver oldalon rendezzük majd a területek sorrendjét mindig, hogy ne legyen baj belőle, hogy valamikor más a sorrend!
Esetleg a szerver kezelje jobban az adatokat? pl az AttackEnv.py process_state metódusában már úgy kerüljön be a raw_state, hogy megadjuk honnan és hová lehet támadni, azaz a szerveren számítjuk ki az attackable részt, azaz a territories tömböt már úgy adjuk át, hogy ott minden terület neve mellett csak a seregek száma van, és két flag, egyik szerint, hogy az AI birtokolja-e, másik szerint pedig, hogy támadhat-e onnan, és ha igen, akkor hogy hová (tömb, ha nem támadhat, akkor üres..)??
A jutalom számításának menete.. lehetne úgy, hogy amikor a JSsendAction-t hívjuk, akkor ha ő sikeresen létrehozza, akkor már a rewardot is adja vissza, és akkor nem kell külön számolni itt. példa hozzá:
def calculate_reward(self, action_result):
        base_reward = 0.0

        if action_result["territory_captured"]:
            base_reward += 1.0
            if action_result.get("captured_port", False):
                base_reward += 0.5  # Extra jutalom kikötőért
                print("Captured a port! Extra reward: 0.5") 
            if action_result.get("captured_fortress", False):
                base_reward += 0.75  # Extra jutalom várért
                print("Captured a fortress! Extra reward: 0.75") 

        if action_result["lost_armies"]:
            base_reward -= 0.1 * action_result["lost_armies"]
            print(f"Lost armies: {action_result['lost_armies']}. Penalty applied.")

        print(f"Calculated Reward: {base_reward}")
        return base_reward


JSPyBridge:

from javascript import require
gameService = require("../../../services/dist/gamesService")

de előtte src mappában:
tsc services/gamesService.ts --outDir dist