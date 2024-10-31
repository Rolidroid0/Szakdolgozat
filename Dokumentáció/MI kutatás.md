Bevezetés

Kutatásom fő célja egy megfelelő RL (megerősítéses tanulás) könyvtár megtalálása a játékomhoz. A társas rendelkezik egy beépített mesterséges intelligencia (továbbiakban MI) ellenféllel, ami a szerver oldalon helyezkedik el. {írni róla, hogy mi is az MI hogyan tanul stb.} A terveim szerint az MI megerősítéses tanulás (RL - reinforcement learning) által fejleszti önmagát {részletezni}. Ehhez próbálok a továbbiakban megfelelő ötleteket, könyvtárakat, segítséget találni. 

Tensorflow.js RL

A TensorFlow.js egy olyan gépi tanulásos könyvtár, ami JavaScript nyelven alapul. A segítségével futtathatunk meglévő modelleket, újra taníthatjuk őket, vagy akár írhatunk sajátokat is JavaScript használatával. A meglévő modelleket futtathatjuk webes, illetve böngészőalapú alkalmazásainkban és Node.js környezetben különböző feladatok megoldásához. Ilyen feladatok például a képosztályozás, arc- és tárgyfelismerés vagy különböző nyelvi kérdések megválaszolása. Ezek által kiváló megoldást jelenthet webalapú játékok esetén is. 
Meglévő modell újratanítása a társasjátékom esetében nem opció, mivel a megerősítéses tanuláson alapuló modellek általában specifikus feladatokhoz készülnek, ezért egy meglévő modell alkalmazása a játékomban nem feltétlenül eredményes. A különböző játékokban eltérő környezetekkel és döntési struktúrákkal találkozunk, amelyek miatt egy előre betanított modell aligha illeszkedne jól a játékom szabályaihoz. 
A TensorFlow.js-en belüli RL használata meglehetősen bonyolult lenne, mivel jelenleg nem érhető el kifejezetten az RL-nek dedikált könyvtár, mint például a Python-alapú TensorFlow tf-agents csomagja. A TensorFlow.js lehetővé teszi a gépi tanulási modellek JavaScript-ben való használatát, azonban RL specifikus implementációkat nem biztosít.  

https://www.tensorflow.org/js/tutorials#convert_pretained_models_to_tensorflowjs
https://www.tensorflow.org/js/tutorials/conversion/import_keras
https://www.tensorflow.org/js/tutorials/conversion/import_saved_model

Egy megerősítéses tanulást alkalmazó keretrendszer olyan ügynököket használ, amelyek célja egy virtuális környezetben való optimalizált döntéshozás. A döntéshozatal mellett tanulnak az elvégzett akciók és a velük járó jutalmak közötti kapcsolatokból, ezáltal fejlesztve a jövőbeli optimális döntéshozatalukat. Az ügynök és a környezet folyamatosan interaktál egymással. Az ügynök hoz egy döntést a jelenlegi környezeti állapotban a saját policy-je (fordítás?) alapján, majd kap egy jutalmat és a következő állapotát a környezetnek. A cél a policy fejlesztése, hogy a jutalmak összege a lehető legmagasabb legyen. Ezek megvalósításához ideális megoldás lehet a TensorFlow, mivel támogatja a tf-agents csomag használatát.

DQN Agent és Q-Learning

Python RL

Interfacing

Konklúzió

Források:
https://www.tensorflow.org/js
https://www.tensorflow.org/js/models
https://www.tensorflow.org/agents/tutorials/0_intro_rl
