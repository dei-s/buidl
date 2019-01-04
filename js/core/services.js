/******************************************************************************
 * Copyright © 2016 The Waves Developers.                                     *
 *                                                                            *
 * See the LICENSE files at                                                   *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * Waves software, including this file, may be copied, modified, propagated,  *
 * or distributed except according to the terms contained in the LICENSE      *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

(function() {
	'use strict';

	angular.module('waves.core.services', ['waves.core', 'restangular'])
		.config(function () {
			if (!String.prototype.startsWith) {
				Object.defineProperty(String.prototype, 'startsWith', {
					enumerable: false,
					configurable: false,
					writable: false,
					value: function(searchString, position) {
						position = position || 0;
						return this.lastIndexOf(searchString, position) === position;
					}
				});
			}

			if (typeof String.prototype.endsWith !== 'function') {
				String.prototype.endsWith = function(suffix) {
					return this.indexOf(suffix, this.length - suffix.length) !== -1;
				};
			}
		});
})();

//https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md
(function() {
	'use strict';

	angular
		.module('waves.core.services')
		.constant('wordList', [
			'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access',
			'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act', 'action',
			'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
			'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent', 'agree', 'ahead', 'aim', 'air',
			'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost',
			'alone', 'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among', 'amount', 'amused',
			'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry', 'animal', 'ankle', 'announce', 'annual',
			'another', 'answer', 'antenna', 'antique', 'anxiety', 'any', 'apart', 'apology', 'appear', 'apple',
			'approve', 'april', 'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around',
			'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact', 'artist', 'artwork', 'ask', 'aspect', 'assault',
			'asset', 'assist', 'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract',
			'auction', 'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid', 'awake',
			'aware', 'away', 'awesome', 'awful', 'awkward', 'axis', 'baby', 'bachelor', 'bacon', 'badge', 'bag',
			'balance', 'balcony', 'ball', 'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base',
			'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become', 'beef', 'before', 'begin',
			'behave', 'behind', 'believe', 'below', 'belt', 'bench', 'benefit', 'best', 'betray', 'better', 'between',
			'beyond', 'bicycle', 'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black', 'blade', 'blame',
			'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood', 'blossom', 'blouse', 'blue', 'blur', 'blush',
			'board', 'boat', 'body', 'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring', 'borrow',
			'boss', 'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain', 'brand', 'brass', 'brave', 'bread', 'breeze',
			'brick', 'bridge', 'brief', 'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze', 'broom', 'brother',
			'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb', 'bulk', 'bullet', 'bundle',
			'bunker', 'burden', 'burger', 'burst', 'bus', 'business', 'busy', 'butter', 'buyer', 'buzz', 'cabbage',
			'cabin', 'cable', 'cactus', 'cage', 'cake', 'call', 'calm', 'camera', 'camp', 'can', 'canal', 'cancel',
			'candy', 'cannon', 'canoe', 'canvas', 'canyon', 'capable', 'capital', 'captain', 'car', 'carbon', 'card',
			'cargo', 'carpet', 'carry', 'cart', 'case', 'cash', 'casino', 'castle', 'casual', 'cat', 'catalog', 'catch',
			'category', 'cattle', 'caught', 'cause', 'caution', 'cave', 'ceiling', 'celery', 'cement', 'census',
			'century', 'cereal', 'certain', 'chair', 'chalk', 'champion', 'change', 'chaos', 'chapter', 'charge',
			'chase', 'chat', 'cheap', 'check', 'cheese', 'chef', 'cherry', 'chest', 'chicken', 'chief', 'child',
			'chimney', 'choice', 'choose', 'chronic', 'chuckle', 'chunk', 'churn', 'cigar', 'cinnamon', 'circle',
			'citizen', 'city', 'civil', 'claim', 'clap', 'clarify', 'claw', 'clay', 'clean', 'clerk', 'clever', 'click',
			'client', 'cliff', 'climb', 'clinic', 'clip', 'clock', 'clog', 'close', 'cloth', 'cloud', 'clown', 'club',
			'clump', 'cluster', 'clutch', 'coach', 'coast', 'coconut', 'code', 'coffee', 'coil', 'coin', 'collect',
			'color', 'column', 'combine', 'come', 'comfort', 'comic', 'common', 'company', 'concert', 'conduct',
			'confirm', 'congress', 'connect', 'consider', 'control', 'convince', 'cook', 'cool', 'copper', 'copy',
			'coral', 'core', 'corn', 'correct', 'cost', 'cotton', 'couch', 'country', 'couple', 'course', 'cousin',
			'cover', 'coyote', 'crack', 'cradle', 'craft', 'cram', 'crane', 'crash', 'crater', 'crawl', 'crazy',
			'cream', 'credit', 'creek', 'crew', 'cricket', 'crime', 'crisp', 'critic', 'crop', 'cross', 'crouch',
			'crowd', 'crucial', 'cruel', 'cruise', 'crumble', 'crunch', 'crush', 'cry', 'crystal', 'cube', 'culture',
			'cup', 'cupboard', 'curious', 'current', 'curtain', 'curve', 'cushion', 'custom', 'cute', 'cycle', 'dad',
			'damage', 'damp', 'dance', 'danger', 'daring', 'dash', 'daughter', 'dawn', 'day', 'deal', 'debate',
			'debris', 'decade', 'december', 'decide', 'decline', 'decorate', 'decrease', 'deer', 'defense', 'define',
			'defy', 'degree', 'delay', 'deliver', 'demand', 'demise', 'denial', 'dentist', 'deny', 'depart', 'depend',
			'deposit', 'depth', 'deputy', 'derive', 'describe', 'desert', 'design', 'desk', 'despair', 'destroy',
			'detail', 'detect', 'develop', 'device', 'devote', 'diagram', 'dial', 'diamond', 'diary', 'dice', 'diesel',
			'diet', 'differ', 'digital', 'dignity', 'dilemma', 'dinner', 'dinosaur', 'direct', 'dirt', 'disagree',
			'discover', 'disease', 'dish', 'dismiss', 'disorder', 'display', 'distance', 'divert', 'divide', 'divorce',
			'dizzy', 'doctor', 'document', 'dog', 'doll', 'dolphin', 'domain', 'donate', 'donkey', 'donor', 'door',
			'dose', 'double', 'dove', 'draft', 'dragon', 'drama', 'drastic', 'draw', 'dream', 'dress', 'drift', 'drill',
			'drink', 'drip', 'drive', 'drop', 'drum', 'dry', 'duck', 'dumb', 'dune', 'during', 'dust', 'dutch', 'duty',
			'dwarf', 'dynamic', 'eager', 'eagle', 'early', 'earn', 'earth', 'easily', 'east', 'easy', 'echo', 'ecology',
			'economy', 'edge', 'edit', 'educate', 'effort', 'egg', 'eight', 'either', 'elbow', 'elder', 'electric',
			'elegant', 'element', 'elephant', 'elevator', 'elite', 'else', 'embark', 'embody', 'embrace', 'emerge',
			'emotion', 'employ', 'empower', 'empty', 'enable', 'enact', 'end', 'endless', 'endorse', 'enemy', 'energy',
			'enforce', 'engage', 'engine', 'enhance', 'enjoy', 'enlist', 'enough', 'enrich', 'enroll', 'ensure',
			'enter', 'entire', 'entry', 'envelope', 'episode', 'equal', 'equip', 'era', 'erase', 'erode', 'erosion',
			'error', 'erupt', 'escape', 'essay', 'essence', 'estate', 'eternal', 'ethics', 'evidence', 'evil', 'evoke',
			'evolve', 'exact', 'example', 'excess', 'exchange', 'excite', 'exclude', 'excuse', 'execute', 'exercise',
			'exhaust', 'exhibit', 'exile', 'exist', 'exit', 'exotic', 'expand', 'expect', 'expire', 'explain', 'expose',
			'express', 'extend', 'extra', 'eye', 'eyebrow', 'fabric', 'face', 'faculty', 'fade', 'faint', 'faith',
			'fall', 'false', 'fame', 'family', 'famous', 'fan', 'fancy', 'fantasy', 'farm', 'fashion', 'fat', 'fatal',
			'father', 'fatigue', 'fault', 'favorite', 'feature', 'february', 'federal', 'fee', 'feed', 'feel', 'female',
			'fence', 'festival', 'fetch', 'fever', 'few', 'fiber', 'fiction', 'field', 'figure', 'file', 'film',
			'filter', 'final', 'find', 'fine', 'finger', 'finish', 'fire', 'firm', 'first', 'fiscal', 'fish', 'fit',
			'fitness', 'fix', 'flag', 'flame', 'flash', 'flat', 'flavor', 'flee', 'flight', 'flip', 'float', 'flock',
			'floor', 'flower', 'fluid', 'flush', 'fly', 'foam', 'focus', 'fog', 'foil', 'fold', 'follow', 'food',
			'foot', 'force', 'forest', 'forget', 'fork', 'fortune', 'forum', 'forward', 'fossil', 'foster', 'found',
			'fox', 'fragile', 'frame', 'frequent', 'fresh', 'friend', 'fringe', 'frog', 'front', 'frost', 'frown',
			'frozen', 'fruit', 'fuel', 'fun', 'funny', 'furnace', 'fury', 'future', 'gadget', 'gain', 'galaxy',
			'gallery', 'game', 'gap', 'garage', 'garbage', 'garden', 'garlic', 'garment', 'gas', 'gasp', 'gate',
			'gather', 'gauge', 'gaze', 'general', 'genius', 'genre', 'gentle', 'genuine', 'gesture', 'ghost', 'giant',
			'gift', 'giggle', 'ginger', 'giraffe', 'girl', 'give', 'glad', 'glance', 'glare', 'glass', 'glide',
			'glimpse', 'globe', 'gloom', 'glory', 'glove', 'glow', 'glue', 'goat', 'goddess', 'gold', 'good', 'goose',
			'gorilla', 'gospel', 'gossip', 'govern', 'gown', 'grab', 'grace', 'grain', 'grant', 'grape', 'grass',
			'gravity', 'great', 'green', 'grid', 'grief', 'grit', 'grocery', 'group', 'grow', 'grunt', 'guard', 'guess',
			'guide', 'guilt', 'guitar', 'gun', 'gym', 'habit', 'hair', 'half', 'hammer', 'hamster', 'hand', 'happy',
			'harbor', 'hard', 'harsh', 'harvest', 'hat', 'have', 'hawk', 'hazard', 'head', 'health', 'heart', 'heavy',
			'hedgehog', 'height', 'hello', 'helmet', 'help', 'hen', 'hero', 'hidden', 'high', 'hill', 'hint', 'hip',
			'hire', 'history', 'hobby', 'hockey', 'hold', 'hole', 'holiday', 'hollow', 'home', 'honey', 'hood', 'hope',
			'horn', 'horror', 'horse', 'hospital', 'host', 'hotel', 'hour', 'hover', 'hub', 'huge', 'human', 'humble',
			'humor', 'hundred', 'hungry', 'hunt', 'hurdle', 'hurry', 'hurt', 'husband', 'hybrid', 'ice', 'icon', 'idea',
			'identify', 'idle', 'ignore', 'ill', 'illegal', 'illness', 'image', 'imitate', 'immense', 'immune',
			'impact', 'impose', 'improve', 'impulse', 'inch', 'include', 'income', 'increase', 'index', 'indicate',
			'indoor', 'industry', 'infant', 'inflict', 'inform', 'inhale', 'inherit', 'initial', 'inject', 'injury',
			'inmate', 'inner', 'innocent', 'input', 'inquiry', 'insane', 'insect', 'inside', 'inspire', 'install',
			'intact', 'interest', 'into', 'invest', 'invite', 'involve', 'iron', 'island', 'isolate', 'issue', 'item',
			'ivory', 'jacket', 'jaguar', 'jar', 'jazz', 'jealous', 'jeans', 'jelly', 'jewel', 'job', 'join', 'joke',
			'journey', 'joy', 'judge', 'juice', 'jump', 'jungle', 'junior', 'junk', 'just', 'kangaroo', 'keen', 'keep',
			'ketchup', 'key', 'kick', 'kid', 'kidney', 'kind', 'kingdom', 'kiss', 'kit', 'kitchen', 'kite', 'kitten',
			'kiwi', 'knee', 'knife', 'knock', 'know', 'lab', 'label', 'labor', 'ladder', 'lady', 'lake', 'lamp',
			'language', 'laptop', 'large', 'later', 'latin', 'laugh', 'laundry', 'lava', 'law', 'lawn', 'lawsuit',
			'layer', 'lazy', 'leader', 'leaf', 'learn', 'leave', 'lecture', 'left', 'leg', 'legal', 'legend', 'leisure',
			'lemon', 'lend', 'length', 'lens', 'leopard', 'lesson', 'letter', 'level', 'liar', 'liberty', 'library',
			'license', 'life', 'lift', 'light', 'like', 'limb', 'limit', 'link', 'lion', 'liquid', 'list', 'little',
			'live', 'lizard', 'load', 'loan', 'lobster', 'local', 'lock', 'logic', 'lonely', 'long', 'loop', 'lottery',
			'loud', 'lounge', 'love', 'loyal', 'lucky', 'luggage', 'lumber', 'lunar', 'lunch', 'luxury', 'lyrics',
			'machine', 'mad', 'magic', 'magnet', 'maid', 'mail', 'main', 'major', 'make', 'mammal', 'man', 'manage',
			'mandate', 'mango', 'mansion', 'manual', 'maple', 'marble', 'march', 'margin', 'marine', 'market',
			'marriage', 'mask', 'mass', 'master', 'match', 'material', 'math', 'matrix', 'matter', 'maximum', 'maze',
			'meadow', 'mean', 'measure', 'meat', 'mechanic', 'medal', 'media', 'melody', 'melt', 'member', 'memory',
			'mention', 'menu', 'mercy', 'merge', 'merit', 'merry', 'mesh', 'message', 'metal', 'method', 'middle',
			'midnight', 'milk', 'million', 'mimic', 'mind', 'minimum', 'minor', 'minute', 'miracle', 'mirror', 'misery',
			'miss', 'mistake', 'mix', 'mixed', 'mixture', 'mobile', 'model', 'modify', 'mom', 'moment', 'monitor',
			'monkey', 'monster', 'month', 'moon', 'moral', 'more', 'morning', 'mosquito', 'mother', 'motion', 'motor',
			'mountain', 'mouse', 'move', 'movie', 'much', 'muffin', 'mule', 'multiply', 'muscle', 'museum', 'mushroom',
			'music', 'must', 'mutual', 'myself', 'mystery', 'myth', 'naive', 'name', 'napkin', 'narrow', 'nasty',
			'nation', 'nature', 'near', 'neck', 'need', 'negative', 'neglect', 'neither', 'nephew', 'nerve', 'nest',
			'net', 'network', 'neutral', 'never', 'news', 'next', 'nice', 'night', 'noble', 'noise', 'nominee',
			'noodle', 'normal', 'north', 'nose', 'notable', 'note', 'nothing', 'notice', 'novel', 'now', 'nuclear',
			'number', 'nurse', 'nut', 'oak', 'obey', 'object', 'oblige', 'obscure', 'observe', 'obtain', 'obvious',
			'occur', 'ocean', 'october', 'odor', 'off', 'offer', 'office', 'often', 'oil', 'okay', 'old', 'olive',
			'olympic', 'omit', 'once', 'one', 'onion', 'online', 'only', 'open', 'opera', 'opinion', 'oppose',
			'option', 'orange', 'orbit', 'orchard', 'order', 'ordinary', 'organ', 'orient', 'original', 'orphan',
			'ostrich', 'other', 'outdoor', 'outer', 'output', 'outside', 'oval', 'oven', 'over', 'own', 'owner',
			'oxygen', 'oyster', 'ozone', 'pact', 'paddle', 'page', 'pair', 'palace', 'palm', 'panda', 'panel', 'panic',
			'panther', 'paper', 'parade', 'parent', 'park', 'parrot', 'party', 'pass', 'patch', 'path', 'patient',
			'patrol', 'pattern', 'pause', 'pave', 'payment', 'peace', 'peanut', 'pear', 'peasant', 'pelican', 'pen',
			'penalty', 'pencil', 'people', 'pepper', 'perfect', 'permit', 'person', 'pet', 'phone', 'photo', 'phrase',
			'physical', 'piano', 'picnic', 'picture', 'piece', 'pig', 'pigeon', 'pill', 'pilot', 'pink', 'pioneer',
			'pipe', 'pistol', 'pitch', 'pizza', 'place', 'planet', 'plastic', 'plate', 'play', 'please', 'pledge',
			'pluck', 'plug', 'plunge', 'poem', 'poet', 'point', 'polar', 'pole', 'police', 'pond', 'pony', 'pool',
			'popular', 'portion', 'position', 'possible', 'post', 'potato', 'pottery', 'poverty', 'powder', 'power',
			'practice', 'praise', 'predict', 'prefer', 'prepare', 'present', 'pretty', 'prevent', 'price', 'pride',
			'primary', 'print', 'priority', 'prison', 'private', 'prize', 'problem', 'process', 'produce', 'profit',
			'program', 'project', 'promote', 'proof', 'property', 'prosper', 'protect', 'proud', 'provide', 'public',
			'pudding', 'pull', 'pulp', 'pulse', 'pumpkin', 'punch', 'pupil', 'puppy', 'purchase', 'purity', 'purpose',
			'purse', 'push', 'put', 'puzzle', 'pyramid', 'quality', 'quantum', 'quarter', 'question', 'quick', 'quit',
			'quiz', 'quote', 'rabbit', 'raccoon', 'race', 'rack', 'radar', 'radio', 'rail', 'rain', 'raise', 'rally',
			'ramp', 'ranch', 'random', 'range', 'rapid', 'rare', 'rate', 'rather', 'raven', 'raw', 'razor', 'ready',
			'real', 'reason', 'rebel', 'rebuild', 'recall', 'receive', 'recipe', 'record', 'recycle', 'reduce',
			'reflect', 'reform', 'refuse', 'region', 'regret', 'regular', 'reject', 'relax', 'release', 'relief',
			'rely', 'remain', 'remember', 'remind', 'remove', 'render', 'renew', 'rent', 'reopen', 'repair', 'repeat',
			'replace', 'report', 'require', 'rescue', 'resemble', 'resist', 'resource', 'response', 'result', 'retire',
			'retreat', 'return', 'reunion', 'reveal', 'review', 'reward', 'rhythm', 'rib', 'ribbon', 'rice', 'rich',
			'ride', 'ridge', 'rifle', 'right', 'rigid', 'ring', 'riot', 'ripple', 'risk', 'ritual', 'rival', 'river',
			'road', 'roast', 'robot', 'robust', 'rocket', 'romance', 'roof', 'rookie', 'room', 'rose', 'rotate',
			'rough', 'round', 'route', 'royal', 'rubber', 'rude', 'rug', 'rule', 'run', 'runway', 'rural', 'sad',
			'saddle', 'sadness', 'safe', 'sail', 'salad', 'salmon', 'salon', 'salt', 'salute', 'same', 'sample', 'sand',
			'satisfy', 'satoshi', 'sauce', 'sausage', 'save', 'say', 'scale', 'scan', 'scare', 'scatter', 'scene',
			'scheme', 'school', 'science', 'scissors', 'scorpion', 'scout', 'scrap', 'screen', 'script', 'scrub', 'sea',
			'search', 'season', 'seat', 'second', 'secret', 'section', 'security', 'seed', 'seek', 'segment', 'select',
			'sell', 'seminar', 'senior', 'sense', 'sentence', 'series', 'service', 'session', 'settle', 'setup',
			'seven', 'shadow', 'shaft', 'shallow', 'share', 'shed', 'shell', 'sheriff', 'shield', 'shift', 'shine',
			'ship', 'shiver', 'shock', 'shoe', 'shoot', 'shop', 'short', 'shoulder', 'shove', 'shrimp', 'shrug',
			'shuffle', 'shy', 'sibling', 'sick', 'side', 'siege', 'sight', 'sign', 'silent', 'silk', 'silly', 'silver',
			'similar', 'simple', 'since', 'sing', 'siren', 'sister', 'situate', 'six', 'size', 'skate', 'sketch', 'ski',
			'skill', 'skin', 'skirt', 'skull', 'slab', 'slam', 'sleep', 'slender', 'slice', 'slide', 'slight', 'slim',
			'slogan', 'slot', 'slow', 'slush', 'small', 'smart', 'smile', 'smoke', 'smooth', 'snack', 'snake', 'snap',
			'sniff', 'snow', 'soap', 'soccer', 'social', 'sock', 'soda', 'soft', 'solar', 'soldier', 'solid',
			'solution', 'solve', 'someone', 'song', 'soon', 'sorry', 'sort', 'soul', 'sound', 'soup', 'source', 'south',
			'space', 'spare', 'spatial', 'spawn', 'speak', 'special', 'speed', 'spell', 'spend', 'sphere', 'spice',
			'spider', 'spike', 'spin', 'spirit', 'split', 'spoil', 'sponsor', 'spoon', 'sport', 'spot', 'spray',
			'spread', 'spring', 'spy', 'square', 'squeeze', 'squirrel', 'stable', 'stadium', 'staff', 'stage', 'stairs',
			'stamp', 'stand', 'start', 'state', 'stay', 'steak', 'steel', 'stem', 'step', 'stereo', 'stick', 'still',
			'sting', 'stock', 'stomach', 'stone', 'stool', 'story', 'stove', 'strategy', 'street', 'strike', 'strong',
			'struggle', 'student', 'stuff', 'stumble', 'style', 'subject', 'submit', 'subway', 'success', 'such',
			'sudden', 'suffer', 'sugar', 'suggest', 'suit', 'summer', 'sun', 'sunny', 'sunset', 'super', 'supply',
			'supreme', 'sure', 'surface', 'surge', 'surprise', 'surround', 'survey', 'suspect', 'sustain', 'swallow',
			'swamp', 'swap', 'swarm', 'swear', 'sweet', 'swift', 'swim', 'swing', 'switch', 'sword', 'symbol',
			'symptom', 'syrup', 'system', 'table', 'tackle', 'tag', 'tail', 'talent', 'talk', 'tank', 'tape', 'target',
			'task', 'taste', 'tattoo', 'taxi', 'teach', 'team', 'tell', 'ten', 'tenant', 'tennis', 'tent', 'term',
			'test', 'text', 'thank', 'that', 'theme', 'then', 'theory', 'there', 'they', 'thing', 'this', 'thought',
			'three', 'thrive', 'throw', 'thumb', 'thunder', 'ticket', 'tide', 'tiger', 'tilt', 'timber', 'time', 'tiny',
			'tip', 'tired', 'tissue', 'title', 'toast', 'tobacco', 'today', 'toddler', 'toe', 'together', 'toilet',
			'token', 'tomato', 'tomorrow', 'tone', 'tongue', 'tonight', 'tool', 'tooth', 'top', 'topic', 'topple',
			'torch', 'tornado', 'tortoise', 'toss', 'total', 'tourist', 'toward', 'tower', 'town', 'toy', 'track',
			'trade', 'traffic', 'tragic', 'train', 'transfer', 'trap', 'trash', 'travel', 'tray', 'treat', 'tree',
			'trend', 'trial', 'tribe', 'trick', 'trigger', 'trim', 'trip', 'trophy', 'trouble', 'truck', 'true',
			'truly', 'trumpet', 'trust', 'truth', 'try', 'tube', 'tuition', 'tumble', 'tuna', 'tunnel', 'turkey',
			'turn', 'turtle', 'twelve', 'twenty', 'twice', 'twin', 'twist', 'two', 'type', 'typical', 'ugly',
			'umbrella', 'unable', 'unaware', 'uncle', 'uncover', 'under', 'undo', 'unfair', 'unfold', 'unhappy',
			'uniform', 'unique', 'unit', 'universe', 'unknown', 'unlock', 'until', 'unusual', 'unveil', 'update',
			'upgrade', 'uphold', 'upon', 'upper', 'upset', 'urban', 'urge', 'usage', 'use', 'used', 'useful', 'useless',
			'usual', 'utility', 'vacant', 'vacuum', 'vague', 'valid', 'valley', 'valve', 'van', 'vanish', 'vapor',
			'various', 'vast', 'vault', 'vehicle', 'velvet', 'vendor', 'venture', 'venue', 'verb', 'verify', 'version',
			'very', 'vessel', 'veteran', 'viable', 'vibrant', 'vicious', 'victory', 'video', 'view', 'village',
			'vintage', 'violin', 'virtual', 'virus', 'visa', 'visit', 'visual', 'vital', 'vivid', 'vocal', 'voice',
			'void', 'volcano', 'volume', 'vote', 'voyage', 'wage', 'wagon', 'wait', 'walk', 'wall', 'walnut', 'want',
			'warfare', 'warm', 'warrior', 'wash', 'wasp', 'waste', 'water', 'wave', 'way', 'wealth', 'weapon', 'wear',
			'weasel', 'weather', 'web', 'wedding', 'weekend', 'weird', 'welcome', 'west', 'wet', 'whale', 'what',
			'wheat', 'wheel', 'when', 'where', 'whip', 'whisper', 'wide', 'width', 'wife', 'wild', 'will', 'win',
			'window', 'wine', 'wing', 'wink', 'winner', 'winter', 'wire', 'wisdom', 'wise', 'wish', 'witness', 'wolf',
			'woman', 'wonder', 'wood', 'wool', 'word', 'work', 'world', 'worry', 'worth', 'wrap', 'wreck', 'wrestle',
			'wrist', 'write', 'wrong', 'yard', 'year', 'yellow', 'you', 'young', 'youth', 'zebra', 'zero', 'zone', 'zoo'
		]);
})();

(function () {
	'use strict';

	angular
		.module('waves.core.services')
		.service('passPhraseService', ['wordList', '$window', function (wordList, $window) {
			this.generate = function () {
				var crypto = $window.crypto || $window.msCrypto;
				var bits = 160;
				var wordCount = wordList.length;
				var log2FromWordCount = Math.log(wordCount) / Math.log(2);
				var wordsInPassPhrase = Math.ceil(bits / log2FromWordCount);
				var random = new Uint16Array(wordsInPassPhrase);
				var passPhrase;

				crypto.getRandomValues(random);

				var i = 0,
					index,
					words = [];

				for (; i < wordsInPassPhrase; i++) {
					index = random[i] % wordCount;
					words.push(wordList[index]);
				}

				passPhrase = words.join(' ');

				crypto.getRandomValues(random);

				return passPhrase;
			};
		}]);
})();

(function () {
	'use strict';

	angular
		.module('waves.core.services')
		.service('accountService', ['storageService', '$q', function (storageService, $q) {
			var stateCache;

			function removeByIndex(state, index) {
				state.accounts.splice(index, 1);

				return state;
			}

			function getState() {
				if (angular.isUndefined(stateCache)) {
					return storageService.loadState().then(function (state) {
						state = state || {};
						if (!state.accounts)
							state.accounts = [];

						stateCache = state;

						return stateCache;
					});
				}

				return $q.when(stateCache);
			}

			this.addAccount = function (accountInfo) {
				return getState()
					.then(function (state) {
						state.accounts.push(accountInfo);

						return state;
					})
					.then(storageService.saveState);
			};

			this.removeAccountByIndex = function (index) {
				return getState()
					.then(function (state) {
						return removeByIndex(state, index);
					})
					.then(storageService.saveState);
			};

			this.removeAccount = function (account) {
				return getState()
					.then(function (state) {
						var index = _.findIndex(state.accounts, {
							address: account.address
						});
						return removeByIndex(state, index);
					})
					.then(storageService.saveState);
			};

			this.getAccounts = function () {
				return getState()
					.then(function (state) {
						return state.accounts;
					});
			};
		}]);
})();

(function () {
	'use strict';

	angular
		.module('waves.core.services')
		.service('addressService', ['constants.address', function (constants) {
			this.cleanupOptionalPrefix = function(displayAddress) {
				if (displayAddress.length <= 30) {
					// Don't change aliases
					return displayAddress;
				}

				var address = displayAddress,
					prefixLen = constants.ADDRESS_PREFIX.length;

				if (address.length > constants.RAW_ADDRESS_LENGTH || address.startsWith(constants.ADDRESS_PREFIX)) {
					address = address.substr(prefixLen, address.length - prefixLen);
				}

				return address;
			};

			this.validateAddress = function(address) {
				var cleanAddress = this.cleanupOptionalPrefix(address);
				return constants.MAINNET_ADDRESS_REGEXP.test(cleanAddress);
			};
		}]);
})();

/**
 * @requires {blake2b-256.js}
 * @requires {Base58.js}
 */
(function() {
	'use strict';

	angular
		.module('waves.core.services')
		.service('cryptoService', ['constants.network', '$window', function(constants, window) {

			// private version of getNetworkId byte in order to avoid circular dependency
			// between cryptoService and utilityService
			var getNetworkIdByte = function() {
				return constants.NETWORK_CODE.charCodeAt(0) & 0xFF;
			};

			var appendUint8Arrays = function(array1, array2) {
				var tmp = new Uint8Array(array1.length + array2.length);
				tmp.set(array1, 0);
				tmp.set(array2, array1.length);
				return tmp;
			};

			var appendNonce = function (originalSeed) {
				// change this is when nonce increment gets introduced
				var nonce = new Uint8Array(converters.int32ToBytes(constants.INITIAL_NONCE, true));

				return appendUint8Arrays(nonce, originalSeed);
			};

			// sha256 accepts messageBytes as Uint8Array or Array
			var sha256 = function (message) {
				var bytes;
				if (typeof(message) == 'string')
					bytes = converters.stringToByteArray(message);
				else
					bytes = message;

				var wordArray = converters.byteArrayToWordArrayEx(new Uint8Array(bytes));
				var resultWordArray = CryptoJS.SHA256(wordArray);

				return converters.wordArrayToByteArrayEx(resultWordArray);
			};

			var prepareKey = function (key) {
				var rounds = 1000;
				var digest = key;
				for (var i = 0; i < rounds; i++) {
					digest = converters.byteArrayToHexString(sha256(digest));
				}

				return digest;
			};

			// blake2b 256 hash function
			this.blake2b = function (input) {
				return blake2b(input, null, 32);
			};

			// keccak 256 hash algorithm
			this.keccak = function(messageBytes) {
				// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
				return keccak_256.array(messageBytes);
				// jscs:enable requireCamelCaseOrUpperCaseIdentifiers
			};

			this.sha256 = sha256;

			this.hashChain = function(noncedSecretPhraseBytes) {
				return this.keccak(this.blake2b(new Uint8Array(noncedSecretPhraseBytes)));
			};

			// Base68 encoding/decoding implementation
			this.base58 = {
				encode: function (buffer) {
					return Base58.encode(buffer);
				},
				decode: function (string) {
					return Base58.decode(string);
				}
			};

			this.buildAccountSeedHash = function(seedBytes) {
				var data = appendNonce(seedBytes);
				var seedHash = this.hashChain(data);

				return sha256(Array.prototype.slice.call(seedHash));
			};

			this.buildKeyPair = function(seedBytes) {
				var accountSeedHash = this.buildAccountSeedHash(seedBytes);
				var p = axlsign.generateKeyPair(accountSeedHash);

				return {
					public: this.base58.encode(p.public),
					private: this.base58.encode(p.private)
				};
			};

			this.buildPublicKey = function (seedBytes) {
				return this.buildKeyPair(seedBytes).public;
			};

			this.buildPrivateKey = function (seedBytes) {
				return this.buildKeyPair(seedBytes).private;
			};

			this.buildRawAddress = function (encodedPublicKey) {
				var publicKey = this.base58.decode(encodedPublicKey);
				var publicKeyHash = this.hashChain(publicKey);

				var prefix = new Uint8Array(2);
				prefix[0] = constants.ADDRESS_VERSION;
				prefix[1] = getNetworkIdByte();

				var unhashedAddress = appendUint8Arrays(prefix, publicKeyHash.slice(0, 20));
				var addressHash = this.hashChain(unhashedAddress).slice(0, 4);

				return this.base58.encode(appendUint8Arrays(unhashedAddress, addressHash));
			};

			this.buildRawAddressFromSeed = function (secretPhrase) {
				var publicKey = this.getPublicKey(secretPhrase);

				return this.buildRawAddress(publicKey);
			};

			//Returns publicKey built from string
			this.getPublicKey = function(secretPhrase) {
				return this.buildPublicKey(converters.stringToByteArray(secretPhrase));
			};

			//Returns privateKey built from string
			this.getPrivateKey = function(secretPhrase) {
				return this.buildPrivateKey(converters.stringToByteArray(secretPhrase));
			};

			//Returns key pair built from string
			this.getKeyPair = function (secretPhrase) {
				return this.buildKeyPair(converters.stringToByteArray(secretPhrase));
			};

			// function accepts buffer with private key and an array with dataToSign
			// returns buffer with signed data
			// 64 randoms bytes are added to the signature
			// method falls back to deterministic signatures if crypto object is not supported
			this.nonDeterministicSign = function(privateKey, dataToSign) {
				var crypto = window.crypto || window.msCrypto;
				var random;
				if (crypto) {
					random = new Uint8Array(64);
					crypto.getRandomValues(random);
				}

				var signature = axlsign.sign(privateKey, new Uint8Array(dataToSign), random);

				return this.base58.encode(signature);
			};

			// function accepts buffer with private key and an array with dataToSign
			// returns buffer with signed data
			this.deterministicSign = function(privateKey, dataToSign) {
				var signature = axlsign.sign(privateKey, new Uint8Array(dataToSign));

				return this.base58.encode(signature);
			};

			this.verify = function(senderPublicKey, dataToSign, signatureBytes) {
				return axlsign.verify(senderPublicKey, dataToSign, signatureBytes);
			};

			// function returns base58 encoded shared key from base58 encoded a private
			// and b public keys
			this.getSharedKey = function (aEncodedPrivateKey, bEncodedPublicKey) {
				var aPrivateKey = this.base58.decode(aEncodedPrivateKey);
				var bPublicKey = this.base58.decode(bEncodedPublicKey);
				var sharedKey = axlsign.sharedKey(aPrivateKey, bPublicKey);

				return this.base58.encode(sharedKey);
			};

			// function can be used for sharedKey preparation, as recommended in: https://github.com/wavesplatform/curve25519-js
			this.prepareKey = function (key) {
				return prepareKey(key);
			};

			this.encryptWalletSeed = function (seed, key) {
				var aesKey = prepareKey(key);

				return CryptoJS.AES.encrypt(seed, aesKey);
			};

			this.decryptWalletSeed = function (cipher, key, checksum) {
				var aesKey = prepareKey(key);
				var data = CryptoJS.AES.decrypt(cipher, aesKey);

				var actualChecksum = this.seedChecksum(converters.hexStringToByteArray(data.toString()));
				if (actualChecksum === checksum)
					return converters.hexStringToString(data.toString());
				else
					return false;
			};

			this.seedChecksum = function (seed) {
				return converters.byteArrayToHexString(sha256(seed));
			};
		}]);
})();

(function () {
	'use strict';

	function AssetService(signService, validateService, utilityService, cryptoService) {
		function buildId(transactionBytes) {
			var hash = cryptoService.blake2b(new Uint8Array(transactionBytes));
			return cryptoService.base58.encode(hash);
		}

		function buildCreateAssetSignatureData (asset, tokensQuantity, senderPublicKey) {
			return [].concat(
				signService.getAssetIssueTxTypeBytes(),
				signService.getPublicKeyBytes(senderPublicKey),
				signService.getAssetNameBytes(asset.name),
				signService.getAssetDescriptionBytes(asset.description),
				signService.getAssetQuantityBytes(tokensQuantity),
				signService.getAssetDecimalPlacesBytes(asset.decimalPlaces),
				signService.getAssetIsReissuableBytes(asset.reissuable),
				signService.getFeeBytes(asset.fee.toCoins()),
				signService.getTimestampBytes(asset.time)
			);
		}

		this.createAssetIssueTransaction = function (asset, sender) {
			validateService.validateAssetIssue(asset);
			validateService.validateSender(sender);

			asset.time = asset.time || utilityService.getTime();
			asset.reissuable = angular.isDefined(asset.reissuable) ? asset.reissuable : false;
			asset.description = asset.description || '';

			var assetCurrency = Currency.create({
				displayName: asset.name,
				precision: asset.decimalPlaces
			});

			var tokens = new Money(asset.totalTokens, assetCurrency);
			var signatureData = buildCreateAssetSignatureData(asset, tokens.toCoins(), sender.publicKey);
			var signature = signService.buildSignature(signatureData, sender.privateKey);

			return {
				id: buildId(signatureData),
				name: asset.name,
				description: asset.description,
				quantity: tokens.toCoins(),
				decimals: Number(asset.decimalPlaces),
				reissuable: asset.reissuable,
				timestamp: asset.time,
				fee: asset.fee.toCoins(),
				senderPublicKey: sender.publicKey,
				signature: signature
			};
		};

		function buildCreateAssetTransferSignatureData(transfer, senderPublicKey) {
			return [].concat(
				signService.getAssetTransferTxTypeBytes(),
				signService.getPublicKeyBytes(senderPublicKey),
				signService.getAssetIdBytes(transfer.amount.currency.id),
				signService.getFeeAssetIdBytes(transfer.fee.currency.id),
				signService.getTimestampBytes(transfer.time),
				signService.getAmountBytes(transfer.amount.toCoins()),
				signService.getFeeBytes(transfer.fee.toCoins()),
				signService.getRecipientBytes(transfer.recipient),
				signService.getAttachmentBytes(transfer.attachment)
			);
		}

		this.createAssetTransferTransaction = function (transfer, sender) {
			validateService.validateAssetTransfer(transfer);
			validateService.validateSender(sender);

			transfer.time = transfer.time || utilityService.getTime();
			transfer.attachment = transfer.attachment || [];
			transfer.recipient = utilityService.resolveAddressOrAlias(transfer.recipient);

			var signatureData = buildCreateAssetTransferSignatureData(transfer, sender.publicKey);
			var signature = signService.buildSignature(signatureData, sender.privateKey);

			return {
				id: buildId(signatureData),
				recipient: transfer.recipient,
				timestamp: transfer.time,
				assetId: transfer.amount.currency.id,
				amount: transfer.amount.toCoins(),
				fee: transfer.fee.toCoins(),
				feeAssetId: transfer.fee.currency.id,
				senderPublicKey: sender.publicKey,
				signature: signature,
				attachment: cryptoService.base58.encode(transfer.attachment)
			};
		};

		function buildCreateAssetReissueSignatureData(reissue, senderPublicKey) {
			return [].concat(
				signService.getAssetReissueTxTypeBytes(),
				signService.getPublicKeyBytes(senderPublicKey),
				signService.getAssetIdBytes(reissue.totalTokens.currency.id, true),
				signService.getAssetQuantityBytes(reissue.totalTokens.toCoins()),
				signService.getAssetIsReissuableBytes(reissue.reissuable),
				signService.getFeeBytes(reissue.fee.toCoins()),
				signService.getTimestampBytes(reissue.time)
			);
		}

		this.createAssetReissueTransaction = function (reissue, sender) {
			validateService.validateAssetReissue(reissue);
			validateService.validateSender(sender);

			reissue.reissuable = angular.isDefined(reissue.reissuable) ? reissue.reissuable : false;
			reissue.time = reissue.time || utilityService.getTime();

			var signatureData = buildCreateAssetReissueSignatureData(reissue, sender.publicKey);
			var signature = signService.buildSignature(signatureData, sender.privateKey);

			return {
				id: buildId(signatureData),
				assetId: reissue.totalTokens.currency.id,
				quantity: reissue.totalTokens.toCoins(),
				reissuable: reissue.reissuable,
				timestamp: reissue.time,
				fee: reissue.fee.toCoins(),
				senderPublicKey: sender.publicKey,
				signature: signature
			};
		};
	}

	AssetService.$inject = ['signService', 'validateService', 'utilityService', 'cryptoService'];

	angular
		.module('waves.core.services')
		.service('assetService', AssetService);
})();

(function () {
	'use strict';

	function AliasRequestService(signService, utilityService, validateService) {
		function buildCreateAliasSignatureData (alias, senderPublicKey) {
			return [].concat(
				signService.getCreateAliasTxTypeBytes(),
				signService.getPublicKeyBytes(senderPublicKey),
				signService.getAliasBytes(alias.alias),
				signService.getFeeBytes(alias.fee.toCoins()),
				signService.getTimestampBytes(alias.time)
			);
		}

		this.buildCreateAliasRequest = function (alias, sender) {
			validateService.validateSender(sender);

			var currentTimeMillis = utilityService.getTime();
			alias.time = alias.time || currentTimeMillis;

			var signatureData = buildCreateAliasSignatureData(alias, sender.publicKey);
			var signature = signService.buildSignature(signatureData, sender.privateKey);

			return {
				alias: alias.alias,
				timestamp: alias.time,
				fee: alias.fee.toCoins(),
				senderPublicKey: sender.publicKey,
				signature: signature
			};
		};
	}

	AliasRequestService.$inject = ['signService', 'utilityService', 'validateService'];

	angular
		.module('waves.core.services')
		.service('aliasRequestService', AliasRequestService);
})();

(function () {
	'use strict';

	function LeasingRequestService(signService, utilityService, validateService) {
		function buildStartLeasingSignatureData (startLeasing, senderPublicKey) {
			return [].concat(
				signService.getStartLeasingTxTypeBytes(),
				signService.getPublicKeyBytes(senderPublicKey),
				signService.getRecipientBytes(startLeasing.recipient),
				signService.getAmountBytes(startLeasing.amount.toCoins()),
				signService.getFeeBytes(startLeasing.fee.toCoins()),
				signService.getTimestampBytes(startLeasing.time)
			);
		}

		this.buildStartLeasingRequest = function (startLeasing, sender) {
			validateService.validateSender(sender);

			var currentTimeMillis = utilityService.getTime();
			startLeasing.time = startLeasing.time || currentTimeMillis;
			startLeasing.recipient = utilityService.resolveAddressOrAlias(startLeasing.recipient);

			var signatureData = buildStartLeasingSignatureData(startLeasing, sender.publicKey);
			var signature = signService.buildSignature(signatureData, sender.privateKey);

			return {
				recipient: startLeasing.recipient,
				amount: startLeasing.amount.toCoins(),
				timestamp: startLeasing.time,
				fee: startLeasing.fee.toCoins(),
				senderPublicKey: sender.publicKey,
				signature: signature
			};
		};

		function buildCancelLeasingSignatureData (cancelLeasing, senderPublicKey) {
			return [].concat(
				signService.getCancelLeasingTxTypeBytes(),
				signService.getPublicKeyBytes(senderPublicKey),
				signService.getFeeBytes(cancelLeasing.fee.toCoins()),
				signService.getTimestampBytes(cancelLeasing.time),
				signService.getTransactionIdBytes(cancelLeasing.startLeasingTransactionId)
			);
		}

		this.buildCancelLeasingRequest = function (cancelLeasing, sender) {
			validateService.validateSender(sender);

			var currentTimeMillis = utilityService.getTime();
			cancelLeasing.time = cancelLeasing.time || currentTimeMillis;

			var signatureData = buildCancelLeasingSignatureData(cancelLeasing, sender.publicKey);
			var signature = signService.buildSignature(signatureData, sender.privateKey);

			return {
				txId: cancelLeasing.startLeasingTransactionId,
				timestamp: cancelLeasing.time,
				fee: cancelLeasing.fee.toCoins(),
				senderPublicKey: sender.publicKey,
				signature: signature
			};
		};
	}

	LeasingRequestService.$inject = ['signService', 'utilityService', 'validateService'];

	angular
		.module('waves.core.services')
		.service('leasingRequestService', LeasingRequestService);
})();

(function () {
	'use strict';

	angular
		.module('waves.core.services')
		.service('apiService', ['Restangular', 'cryptoService', function (rest, cryptoService) {
			var blocksApi = rest.all('blocks');

			this.blocks = {
				height: function() {
					return blocksApi.get('height');
				},
				last: function() {
					return blocksApi.get('last');
				},
				list: function (startHeight, endHeight) {
					return blocksApi.one('seq', startHeight).all(endHeight).getList();
				}
			};

			var addressApi = rest.all('addresses');
			var consensusApi = rest.all('consensus');
			this.address = {
				balance: function (address) {
					return addressApi.one('balance', address).get();
				},
				effectiveBalance: function (address) {
					return addressApi.one('effectiveBalance', address).get();
				},
				generatingBalance: function (address) {
					return consensusApi.one('generatingbalance', address).get();
				}
			};

			var transactionApi = rest.all('transactions');

			var request;
			var timer;
			this.transactions = {
				unconfirmed: function () {
					if (!request) {
						request = transactionApi.all('unconfirmed').getList();
					} else {
						if (!timer) {
							timer = setTimeout(function () {
								request = transactionApi.all('unconfirmed').getList();
								request.finally(function () {
									timer = null;
								});
							}, 10000);
						}
					}
					return request;
				},
				list: function (address, max) {
					max = max || 50;
					return transactionApi.one('address', address).one('limit', max).getList();
				},
				info: function (transactionId) {
					return transactionApi.one('info', transactionId).get();
				}
			};

			var leasingApi = rest.all('leasing').all('broadcast');
			this.leasing = {
				lease: function (signedStartLeasingTransaction) {
					return leasingApi.all('lease').post(signedStartLeasingTransaction);
				},
				cancel: function (signedCancelLeasingTransaction) {
					return leasingApi.all('cancel').post(signedCancelLeasingTransaction);
				}
			};

			var aliasApi = rest.all('alias');
			this.alias = {
				create: function (signedCreateAliasTransaction) {
					return aliasApi.all('broadcast').all('create').post(signedCreateAliasTransaction);
				},
				getByAddress: function (address) {
					return aliasApi.all('by-address').get(address).then(function (response) {
						return response.map(function (alias) {
							return alias.slice(8);
						});
					});
				}
			};

			var assetApi = rest.all('assets');
			var assetBroadcastApi = assetApi.all('broadcast');
			this.assets = {
				balance: function (address, assetId) {
					var rest = assetApi.all('balance');
					if (assetId)
						return rest.all(address).get(assetId);
					else
						return rest.get(address);
				},
				issue: function (signedAssetIssueTransaction) {
					return assetBroadcastApi.all('issue').post(signedAssetIssueTransaction);
				},
				reissue: function (signedAssetReissueTransaction) {
					return assetBroadcastApi.all('reissue').post(signedAssetReissueTransaction);
				},
				transfer: function (signedAssetTransferTransaction) {
					return assetBroadcastApi.all('transfer').post(signedAssetTransferTransaction);
				},
				massPay: function (signedTransactions) {
					return assetBroadcastApi.all('batch-transfer').post(signedTransactions);
				},
				makeAssetNameUnique: function (signedMakeAssetNameUniqueTransaction) {
					return assetApi
						.all('broadcast')
						.all('make-asset-name-unique')
						.post(signedMakeAssetNameUniqueTransaction);
				},
				isUniqueName: function (assetName) {
					assetName = cryptoService.base58.encode(converters.stringToByteArray(assetName));
					return assetApi
						.all('asset-id-by-unique-name')
						.get(assetName)
						.then(function (response) {
							// FIXME : temporary fix for the API format
							if (typeof response !== 'object') {
								response = {assetId: response};
							}

							return response.assetId;
						});
				}
			};
		}]);
})();
