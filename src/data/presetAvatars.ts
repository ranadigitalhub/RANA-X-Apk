// [TECH CONSTRAINT]: Ensure all GIFs under 1.3 MB and optimized to prevent playback issues on mobile. Large files will be skipped by the system.

export interface PremiumAvatar {
  id: number | string;
  name: string;
  url: string;
  category?: string;
  tag?: string;
  approxSizeMb?: number;
}

export type CyberAvatarPreset = PremiumAvatar;

export const premiumAvatars: PremiumAvatar[] = [
  // --- CYBER & RETRO WAVE GIFS ---
  { id: 1, name: "Cyber Legend", url: "https://i.postimg.cc/qv5VPjNR/53678.gif", tag: "CYBER", approxSizeMb: 0.8 },
  { id: 2, name: "Matrix Core", url: "https://i.postimg.cc/Hxbq7mBm/giphy.gif", tag: "MATRIX", approxSizeMb: 0.9 },
  { id: 3, name: "Neon Flux", url: "https://i.postimg.cc/6Q4JtnZV/giphy-(1).gif", tag: "NEON", approxSizeMb: 0.7 },
  { id: 4, name: "Pulse Surge", url: "https://i.postimg.cc/NjMvCWfX/giphy-(11).gif", tag: "PULSE", approxSizeMb: 0.8 },
  { id: 5, name: "Cyber Punk", url: "https://i.postimg.cc/y8dCpwYS/giphy-(12).gif", tag: "PUNK", approxSizeMb: 1.1 },
  { id: 6, name: "Holo Grid", url: "https://i.postimg.cc/tCDH5Xyn/giphy-(13).gif", tag: "HOLO", approxSizeMb: 0.9 },
  { id: 7, name: "Synth Wave", url: "https://i.postimg.cc/sDKRcVyf/giphy-(14).gif", tag: "SYNTH", approxSizeMb: 0.8 },
  { id: 8, name: "Vapor Trail", url: "https://i.postimg.cc/9F1jpWVM/giphy-(15).gif", tag: "VAPOR", approxSizeMb: 0.7 },
  { id: 9, name: "Data Stream", url: "https://i.postimg.cc/vHXdzQMm/giphy-(16).gif", tag: "STREAM", approxSizeMb: 0.9 },
  { id: 10, name: "Glitch Art", url: "https://i.postimg.cc/m2VGwbRh/giphy-(17).gif", tag: "GLITCH", approxSizeMb: 1.0 },
  { id: 11, name: "Retro Vibe", url: "https://i.postimg.cc/ZnShfnCF/giphy-(18).gif", tag: "RETRO", approxSizeMb: 0.8 },
  { id: 12, name: "Neon Knight", url: "https://i.postimg.cc/pd5bRzj2/giphy-(2).gif", tag: "KNIGHT", approxSizeMb: 0.9 },
  { id: 13, name: "Pixel Ghost", url: "https://i.postimg.cc/jS5Y3GdB/giphy-(3).gif", tag: "GHOST", approxSizeMb: 0.8 },
  { id: 14, name: "Cyber Ninja", url: "https://i.postimg.cc/qvRHD9MS/giphy-(4).gif", tag: "NINJA", approxSizeMb: 1.0 },
  { id: 15, name: "Shadow Step", url: "https://i.postimg.cc/P5xnVBrc/giphy-(5).gif", tag: "SHADOW", approxSizeMb: 0.9 },
  { id: 16, name: "Iron Will", url: "https://i.postimg.cc/rwPXBQKf/giphy-(6).gif", tag: "TITAN", approxSizeMb: 0.9 },
  { id: 17, name: "Dark Anime 1", url: "https://i.postimg.cc/g2TFCNxW/tumblr-1ba29665d8d91b64bdd5e6a04f5e5098-406aaf2c-1280.gif", tag: "DARK", approxSizeMb: 1.2 },
  { id: 18, name: "Dark Anime 2", url: "https://i.postimg.cc/rwPXBQDq/tumblr-9ceb5a535bd00ddf7ade0a48a7ac8627-40bee2fb-1280.gif", tag: "DARK", approxSizeMb: 1.2 },
  { id: 19, name: "Avatar 17", url: "https://i.postimg.cc/VNnGKRMg/giphy-(10).gif", tag: "CYBER", approxSizeMb: 0.9 },
  { id: 20, name: "Avatar 18", url: "https://i.postimg.cc/0NDWVfmW/giphy-(7).gif", tag: "CYBER", approxSizeMb: 0.8 },
  { id: 21, name: "Avatar 19", url: "https://i.postimg.cc/cJw9FmYX/giphy-(8).gif", tag: "CYBER", approxSizeMb: 0.9 },
  { id: 22, name: "Avatar 20", url: "https://i.postimg.cc/rpxnfJWg/giphy-(9).gif", tag: "CYBER", approxSizeMb: 0.8 },
  
  // --- EXACT DETECTED CHARACTERS ---
  { id: 23, name: "Ayanokoji", url: "https://i.postimg.cc/CMmvrdZW/ayanokoji-classroom-of-the-elite.gif", tag: "COTE", approxSizeMb: 1.1 },
  { id: 24, name: "Dragon Ball Z", url: "https://i.postimg.cc/ZKQwZgxL/dbz-dragon-ball.gif", tag: "DBZ", approxSizeMb: 1.1 },
  { id: 25, name: "Giggity", url: "https://i.postimg.cc/m2nmRqym/giggitygoooo.gif", tag: "HERO", approxSizeMb: 0.9 },
  { id: 26, name: "Gogeta", url: "https://i.postimg.cc/prXsXM7b/gogeta-dragon-ball.gif", tag: "DBZ FUSION", approxSizeMb: 1.2 },
  { id: 27, name: "Lancer", url: "https://i.postimg.cc/QxCf2s1D/lancer.gif", tag: "FATE", approxSizeMb: 1.0 },
  { id: 28, name: "Sailor Mars (Rei)", url: "https://i.postimg.cc/NfFd3Ymr/sailor-moon-rei.webp", tag: "SAILOR", approxSizeMb: 0.4 },
  { id: 29, name: "Shadow Monarch", url: "https://i.postimg.cc/BbYMjw9n/solo-leveling-solo-leveling-season-2.gif", tag: "SOLO S2", approxSizeMb: 1.2 },
  { id: 30, name: "Sung Jin Woo", url: "https://i.postimg.cc/j2gZDkV1/solo-leveling-sonjino.gif", tag: "SOLO", approxSizeMb: 1.1 },
  { id: 31, name: "Zavarius", url: "https://i.postimg.cc/hvypX3WG/solo-leveling-zavarius.gif", tag: "SOLO", approxSizeMb: 1.0 },
  { id: 32, name: "Arise", url: "https://i.postimg.cc/T2CkNhLv/sungjinwoo-sung-jin-woo.gif", tag: "ARISE", approxSizeMb: 1.2 },
  { id: 33, name: "Zenitsu", url: "https://i.postimg.cc/02jVTxDy/zenitsu.gif", tag: "SLAYER", approxSizeMb: 1.0 }
];

export const PRESET_CYBER_AVATARS = premiumAvatars;
