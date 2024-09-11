# Ütközetek játékmód 2 játékos esetén
1. Essos játéktábla
2. Essos területkártyák (34 db)
3. Seregek (Ghiscari, Targaryen, semleges seregek)
- Játék kezdete: mindkét fél dob, aki nagyobbat dob választ házat
- 12-12 kártya kisorsolása random, maradék 10 semleges
- minden területen 2 sereg
- végül pakli aljára a játék vége kártya random (Valar Morghulis)
### Játékmenet
1. Erősítés (területek, régiók, kártyák majd elhelyezés)
2. Invázió
3. Manőver
4. Húzás

### Mezők
1. Terület: _id, tábla, név, vár, kikötő, régió (fk), szomszédok, seregek száma, birtokos (fk), utoljáraTámadtadInnen*
2. Játékos: _id, ház, pluszSeregek, hódított**, bejelentkezve
3. Régió: _id, tábla, név, régióBónusz, területekSzáma
4. Területkártya***: _id, tábla, név, birtokos (fk), szimbólum, sorszám
5. Csata: honnan (fk), hová (fk), támadó seregek száma
6. Játék: _id, kör, jelenlegiJátékos, játékosok, állapot

*Azt mutatja, hogy melyik körben indult innen támadás, mert egy körben csak egyszer lehet. Minden támadásnál növelődik az értéke.

**Azt mutatja, hogy az adott körben hódított-e már a játékos sikeresen területet.

***Van köztük egy különleges, a játék vége kártya. A sorszám jelzi, hogy a megkevert pakliban hol helyezkedik el.

((régibónusz jár e: COUNT területNév FROM területek WHERE birtokos = ház AND régió = régióNév -- ezt minden régióval és megnézni, hogy egyenlő-e a régió területeinek számával))

### Jegyzet magamnak

Legyen eltárolva, hogy a körön belül melyik lépés van?  erősítés, invázió, manőver és húzás. egyrészt könnyebb követni, hogy most mi jön, másrészt tudjuk pontosan, hogy még várunk-e a felhasználóra, pl a kártyák beváltásánál. Erősítés rész felbontása: kártyák beváltása, seregek elhelyezése.

React keretrendszerben van a client aki websocket segítségével kommunikál a nodejs szerverrel, ezáltal biztosítható a dinamikusság.

Frontend (React):

((npm run dev))
A felhasználói felületet Reacttel fejleszted.
A React alkalmazás WebSocketeken keresztül kommunikál a szerverrel.

Backend (Node.js):

((npm start))
A Node.js szerver kezeli a WebSocket kapcsolatokat.
A Node.js szerver kezeli az adatbázis műveleteket is, és MongoDB-t használ az adatok tárolására.

Adatbázis (MongoDB):

A MongoDB az adatokat tárolja, mint például a játék állapotát, a kártyák eloszlását stb.
A Node.js szerver kapcsolódik a MongoDB-hez, és onnan olvas vagy ír adatokat.

### TODO

1. Akkor lehet a reinforce fázisnak vége, ha nincs több + serege a játékosnak.
2. Csata lebonyolítása
3. Területeken lévő seregek megjelenítése (térkép javítása)
4. Kártyák beváltásánál + seregek száma (szimbólumok + saját területre még 2 sereg)
5. Refaktorálás