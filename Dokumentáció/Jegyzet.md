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
1. Terület: név (id), vár, kikötő, régió (fk), szomszédok, seregek száma, birtokos (fk), támadtakInnen*
2. Játékos: ház (id), pluszSeregek, hódított**
3. Régió: név (id), régióBónusz, területekSzáma
4. Területkártya***: név (id), birtokos (fk), szimbólum, sorszám
5. Csata: honnan (fk), hová (fk), támadó seregek száma

*Azt mutatja, hogy adott körben innen indult-e már támadás, mert egy körben csak egyszer lehet. Minden kör elején hamis lesz az értéke.

**Azt mutatja, hogy az adott körben hódított-e már a játékos sikeresen területet.

***Van köztük egy különleges, a játék vége kártya. A sorszám jelzi, hogy a megkevert pakliban hol helyezkedik el.

((régibónusz jár e: COUNT területNév FROM területek WHERE birtokos = ház AND régió = régióNév -- ezt minden régióval és megnézni, hogy egyenlő-e a régió területeinek számával))

### Jegyzet magamnak

React keretrendszerben van a client aki websocket segítségével kommunikál a nodejs szerverrel, ezáltal biztosítható a dinamikusság.

Frontend (React):

A felhasználói felületet Reacttel fejleszted.
A React alkalmazás WebSocketeken keresztül kommunikál a szerverrel.

Backend (Node.js):

A Node.js szerver kezeli a WebSocket kapcsolatokat.
A Node.js szerver kezeli az adatbázis műveleteket is, és MongoDB-t használ az adatok tárolására.

Adatbázis (MongoDB):

A MongoDB az adatokat tárolja, mint például a játék állapotát, a kártyák eloszlását stb.
A Node.js szerver kapcsolódik a MongoDB-hez, és onnan olvas vagy ír adatokat.
