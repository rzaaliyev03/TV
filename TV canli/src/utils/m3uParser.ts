import { Channel } from '../types';

export function parseM3UPlaylist(content: string): Channel[] {
  const lines = content.split(/\r?\n/);
  const channels: Channel[] = [];
  let currentExtInf: {
    name?: string;
    logoUrl?: string;
    groupTitle?: string;
    country?: string;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const infoMatch = line.match(/#EXTINF:[^,]*,(.*)$/);
      const rawName = infoMatch ? infoMatch[1].trim() : 'Bilinməyən Kanal';

      // Extract attributes
      const nameAttr = line.match(/tvg-name="([^"]+)"/i);
      const logoAttr = line.match(/tvg-logo="([^"]+)"/i);
      const groupAttr = line.match(/group-title="([^"]+)"/i);
      const countryAttr = line.match(/tvg-country="([^"]+)"/i);

      currentExtInf = {
        name: (nameAttr && nameAttr[1]) || rawName,
        logoUrl: (logoAttr && logoAttr[1]) || '',
        groupTitle: (groupAttr && groupAttr[1]) || 'Digər',
        country: (countryAttr && countryAttr[1]) || '',
      };
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      const streamUrl = line;
      const name = currentExtInf?.name || `Kanal ${channels.length + 1}`;
      let category = currentExtInf?.groupTitle || 'Digər';
      let country = currentExtInf?.country || '🌍 Dünya';

      // Smart category mapping
      const lower = (name + ' ' + category).toLowerCase();
      if (lower.includes('idman') || lower.includes('spor') || lower.includes('sport')) {
        category = 'İdman';
      } else if (lower.includes('xeber') || lower.includes('xəbər') || lower.includes('haber') || lower.includes('news')) {
        category = 'Xəbər';
      } else if (lower.includes('musiqi') || lower.includes('muzik') || lower.includes('müzik') || lower.includes('music')) {
        category = 'Musiqi';
      } else if (lower.includes('cocuk') || lower.includes('uşaq') || lower.includes('çocuk') || lower.includes('kids') || lower.includes('cartoon')) {
        category = 'Uşaq';
      } else if (lower.includes('senedli') || lower.includes('sənədli') || lower.includes('belgesel') || lower.includes('doc')) {
        category = 'Sənədli';
      }

      if (lower.includes('az') || lower.includes('azer') || lower.includes('baku') || lower.includes('azad')) {
        country = '🇦🇿 Azərbaycan';
      } else if (lower.includes('tr') || lower.includes('türk') || lower.includes('turk') || lower.includes('istanbul')) {
        country = '🇹🇷 Türkiyə';
      }

      channels.push({
        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name,
        streamUrl,
        logoUrl: currentExtInf?.logoUrl || '',
        category,
        country,
        quality: 'HD',
        isFavorite: false,
        isWorking: true,
        isCustom: true,
        addedAt: Date.now(),
      });

      currentExtInf = null;
    }
  }

  return channels;
}

export function exportToM3U(channels: Channel[]): string {
  let m3u = '#EXTM3U\n';
  channels.forEach((ch) => {
    m3u += `#EXTINF:-1 tvg-id="${ch.id}" tvg-name="${ch.name}" tvg-logo="${ch.logoUrl || ''}" group-title="${ch.category}",${ch.name}\n${ch.streamUrl}\n`;
  });
  return m3u;
}
