// MangaDX API Fetch untuk Manga, Manhwa, dan Manhua
const MANGADX_BASE_URL = 'https://api.mangadex.org';

// Fungsi untuk fetch manga berdasarkan type
async function fetchMangaByType(type, limit = 20) {
  try {
    const response = await fetch(
      `${MANGADX_BASE_URL}/manga?limit=${limit}&publicationDemographic[]=${type}&availableTranslatedLanguage[]=id&order[latestUploadedChapter]=desc&includes[]=cover_art&includes[]=author&includes[]=artist`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return null;
  }
}

// Fungsi untuk fetch manga berdasarkan original language (untuk membedakan manga, manhwa, manhua)
async function fetchMangaByOrigin(originLanguage, limit = 20) {
  try {
    const response = await fetch(
      `${MANGADX_BASE_URL}/manga?limit=${limit}&originalLanguage[]=${originLanguage}&availableTranslatedLanguage[]=id&order[latestUploadedChapter]=desc&includes[]=cover_art&includes[]=author&includes[]=artist`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${originLanguage} comics:`, error);
    return null;
  }
}

// Fungsi untuk fetch manga berdasarkan search query
async function searchManga(query, limit = 20) {
  try {
    const response = await fetch(
      `${MANGADX_BASE_URL}/manga?title=${encodeURIComponent(query)}&limit=${limit}&availableTranslatedLanguage[]=id&order[relevance]=desc&includes[]=cover_art&includes[]=author&includes[]=artist`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching manga:', error);
    return null;
  }
}

// Fungsi untuk format data manga
function formatMangaData(mangaData) {
  if (!mangaData || !mangaData.data) return [];
  
  return mangaData.data.map(manga => {
    const attributes = manga.attributes;
    const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
    const author = manga.relationships.find(rel => rel.type === 'author');
    const artist = manga.relationships.find(rel => rel.type === 'artist');
    
    // Construct cover image URL
    const coverUrl = coverArt 
      ? `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}`
      : null;
    
    return {
      id: manga.id,
      title: attributes.title.en || attributes.title.ja || Object.values(attributes.title)[0],
      description: attributes.description.en || attributes.description.id || 'No description available',
      status: attributes.status,
      year: attributes.year,
      tags: attributes.tags.map(tag => tag.attributes.name.en),
      originalLanguage: attributes.originalLanguage,
      publicationDemographic: attributes.publicationDemographic,
      coverUrl: coverUrl,
      author: author?.attributes?.name || 'Unknown',
      artist: artist?.attributes?.name || 'Unknown',
      chapters: attributes.lastChapter,
      rating: attributes.contentRating
    };
  });
}

// Fungsi utama untuk fetch semua jenis komik
async function fetchAllComics() {
  console.log('Fetching Manga (Japanese)...');
  const manga = await fetchMangaByOrigin('ja', 10);
  
  console.log('Fetching Manhwa (Korean)...');
  const manhwa = await fetchMangaByOrigin('ko', 10);
  
  console.log('Fetching Manhua (Chinese)...');
  const manhua = await fetchMangaByOrigin('zh', 10);
  
  return {
    manga: formatMangaData(manga),
    manhwa: formatMangaData(manhwa),
    manhua: formatMangaData(manhua)
  };
}

// Fungsi untuk fetch manga trending/popular
async function fetchPopularManga(limit = 20) {
  try {
    const response = await fetch(
      `${MANGADX_BASE_URL}/manga?limit=${limit}&availableTranslatedLanguage[]=id&order[followedCount]=desc&includes[]=cover_art&includes[]=author&includes[]=artist`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return formatMangaData(data);
  } catch (error) {
    console.error('Error fetching popular manga:', error);
    return [];
  }
}

// Fungsi untuk fetch detail manga berdasarkan ID
async function fetchMangaDetails(mangaId) {
  try {
    const response = await fetch(
      `${MANGADX_BASE_URL}/manga/${mangaId}?includes[]=cover_art&includes[]=author&includes[]=artist`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return formatMangaData({ data: [data.data] })[0];
  } catch (error) {
    console.error('Error fetching manga details:', error);
    return null;
  }
} 