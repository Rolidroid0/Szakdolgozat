const regions = await regionsCollection.find<Region>({}).toArray();
for (const region of regions) {
	const ownedTerritoriesInRegion = territories.filter(territory => territory.region === region.name);
	if (ownedTerritoriesInRegion.length === region.territory_count) {
		additionalArmies += region.region_bonus;
	}
}