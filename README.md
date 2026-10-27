# GrozCalc — grozu kaloriju kalkulators

**RTU studentu projekts · Rīga, 2026**

**Autori:** Deniss Smirnovs (241RDB243), Vladislavs Hatiņecs (241RDB015), Daniils Galviņš (241RDB283).

## Projekta mērķis

GrozCalc ir uztura un kaloriju uzskaites sistēma, kas palīdz lietotājiem atrast pārtikas produktus vietējos veikalos, reģistrēt patērēto daudzumu, aprēķināt kalorijas un makroelementus, kā arī sekot individuālajiem mērķiem.

## Prasību specifikācija

Atbilstoši projekta dokumentācijai sistēmai paredzētas divas lomas — **lietotājs** un **administrators**. Galvenās prasības: produktu meklēšana pēc nosaukuma, zīmola vai veikala; dienas uzskaite; dienas un nedēļas pārskati; produktu melnais saraksts; administratora produktu ievade un rediģēšana; kvalitātes zīmogi (**Ļoti ieteicams / Neitrāls / Neieteicams**); nākotnē produktu un cenu sinhronizācija.

Dokumentācijā paredzēta tīmekļa un mobilā versija, latviešu/angļu saskarne, SQL datubāze, piekļuves kontrole un droša autentifikācija.

## Dokumentācijā norādītās tehnoloģijas

- Frontend: React Native
- Backend: Node.js
- Datubāze: SQL
- Datu iegūšana: Python
- Autentifikācija: OAuth 2.0 / Firebase Auth
- Hostings: Google Cloud

**Prototipa pašreizējā realizācija atšķiras:** tīmekļa frontend izmanto React + TypeScript + Vite, bez backend. Iepriekš apsvērtā FastAPI izvēle nav dokumentācijā norādītais Node.js backend; pirms backend realizācijas šī atšķirība jāsaskaņo ar komandu.

## Pašreizējais prototips (izstrādes stadijā)

- Stikla stila adaptīva tīmekļa saskarne, ģeometriskas SVG ikonas.
- Produktu katalogs, veikalu filtrēšana un uzturvērtības aprēķini.
- Dienas uztura uzskaite, maināms produktu daudzums un dienas mērķi.
- Lietotāja izveidoti produkti, favorīti un melnais saraksts.
- Septiņu dienu kaloriju pārskats un makroelementu mērķu rediģēšana.
- Administratora produktu pārvaldības **demonstrācijas saskarne**.

**Ierobežojumi:** šobrīd dati glabājas tikai pārlūkprogrammas `localStorage`; nav SQL datubāzes, lietotāju autorizācijas vai servera līmeņa administratora tiesību. Sākotnējie produkti ir ilustratīvi, nevis pārbaudīti veikalu dati. Šis vēl nav pilnībā pabeigts kursa prototips.

## Palaišana

Nepieciešams Node.js 20+.

```bash
git clone -b dev/initial-prototype https://github.com/davlhat/GrozCalc.git
cd GrozCalc
npm install
npm run dev
```

Atveriet terminālī norādīto lokālo adresi. Ražošanas būvei: `npm run build`.

Detalizētas instrukcijas: [docs/TEAM_SETUP.md](docs/TEAM_SETUP.md).

## Turpmākie uzdevumi

1. SQL datubāze un dokumentācijai atbilstošs backend.
2. Autentifikācija, lomas un administratora piekļuves kontrole.
3. Produktu datu verifikācija un datu imports/eksports.
4. Pilna LV/EN lokalizācija, mobilā versija un testi.

## Avoti

- *GrozCalc — Sistēmas prasību specifikācija* (2026).
- *GrozCalc — Sistēmas projektējums* (2026).
