#Diary

## July 15, 2017
Downloaded some Data from BFS going back to 2011
https://www.bfs.admin.ch/bfs/de/home/statistiken/bevoelkerung/migration-integration/erwerb-schweizer-buergerrecht-doppelbuerger.html

## July 16, 2017
Read the story about Funda Yilmaz
https://www.schweizer-illustrierte.ch/gesellschaft/thema/funda-yilmaz-aus-buchs-ag-einbuergerung-protokolle

#July 17, 2007
Worked with the 2011-2015 data, merged naturalizations with population data

#July 18, 2007
- Got more data from BFS going back to 1991 instead of 2011 (su-d-01.02.04.08.xls)
- Battled for 4 hours only reading the excelsheet because they kept changing the format
- Got a list of communes for 2015 from https://www.communes.bfs.admin.ch/de/state/results?SnapshotDate=21.12.2015
- Also, got a new shapefile with the communes for 2015, (not 2017) from https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html

TODO:
- wait for BFS to come up with a useful matrix of cummune changes in order to make communes comparable
- use Bezirke and Kantone List to make summary tables

#July 19, 2007
- Got another data-link from BFS: https://www.pxweb.bfs.admin.ch/Selection.aspx?px_language=de&px_db=px-x-0102020000_201&px_tableid=px-x-0102020000_201\px-x-0102020000_201.px&px_type=PX This time it contains data going back to 1981 and it should be harmonized for commune-changes. let's see!

#July 20, 2007
- Downloaded data from BFS for Einbürgerungen, Schweizer Bevölkerung and Bevölkerung.
- Mofified the correspondence tables for the Districts and Cantons a bit
- DONT PLAY AROUND WITH THE FOLLOWING FILES ANY MORE:
CleanData/Einb-Wide-1981-2015.xls
CleanData/Bev-Wide-1981-2015.xls
CleanData/SchweizerBev-Wide-1981-2015.xls
OriginalData/Kantone-ABK-ID.csv
OriginalData/Gemeindestand-2015.xls
- Wrote 3 notbooks that take the CleanedData-files and separate them into geographical levels.
Separate-Data-Bev.ipnyb
Separate-Data-Einb.ipnyb
Separate-Data-SchweizerBev.ipnyb (probably won't need that one but still good to have it)
- the new data is stored in CleanerData

#The diary stops here
Sorry
