// The word rules the content follows (tools/content-check.mjs applies them; roadmap 6.6 writes them up as a guide).

// Bookish words and the everyday word a child hears at home. For ages 2–8 (Toddler to Grade 2) the everyday
// word is used; from Grade 3 a school word may stay after the everyday one, or in brackets: "उल्टे शब्द (विलोम)".
// After "यानी" a bookish word is fine: the app teaches synonyms that way ("हाथी, यानी गज").
export const BOOKISH = {
  ध्वनि: 'आवाज़',
  विलोम: 'उल्टे शब्द',
  पर्यायवाची: 'एक जैसे मतलब वाले शब्द',
  अत्यंत: 'बहुत',
  अत्यधिक: 'बहुत ज़्यादा',
  प्रसन्न: 'ख़ुश',
  शीघ्र: 'जल्दी',
  किंतु: 'लेकिन',
  परंतु: 'लेकिन',
  अतः: 'इसलिए',
  तत्पश्चात: 'उसके बाद',
  पश्चात: 'बाद में',
  उपरांत: 'बाद में',
  वार्तालाप: 'बातचीत',
  वृक्ष: 'पेड़',
  पुष्प: 'फूल',
  नेत्र: 'आँख',
  भोजन: 'खाना',
  विद्यालय: 'स्कूल',
  पुस्तक: 'किताब',
  प्रातः: 'सुबह',
  प्रश्न: 'सवाल',
  चिह्न: 'निशान',
  सजीव: 'जानदार',
  निर्जीव: 'बेजान',
  वर्षा: 'बारिश',
  अग्नि: 'आग',
  चंद्रमा: 'चाँद',
  मित्र: 'दोस्त',
  सहायता: 'मदद',
  प्रयास: 'कोशिश',
  आरंभ: 'शुरू',
  समाप्त: 'ख़त्म',
  यदि: 'अगर',
  कदापि: 'कभी नहीं',
  अश्व: 'घोड़ा',
  उपहार: 'तोहफ़ा',
  क्रोध: 'ग़ुस्सा',
  भयभीत: 'डरा हुआ',
  निवास: 'घर',
  कृपया: 'ज़रा',
};

// Set phrases that keep a bookish word, because that is how everyone says them.
export const KEEP_AS_IS = ['शुभ रात्रि', 'प्रश्नोत्तरी', 'पुस्तक बस'];

// One spelling for each word: the spelling on the left is written as the one on the right everywhere.
// The standard spelling of the Central Hindi Directorate: the anusvara (ं) for a nasal before a consonant
// of its own group (हिंदी, सुंदर, अंदर), ए/ई rather than ये/यी in verb endings (गई, आएगा), and the nukta
// where it is said (ज़रूर, ज़्यादा). खुद/ख़ुद is not on the list: खुद (dug) and ख़ुद (self) are both words.
export const SPELLING = {
  हिन्दी: 'हिंदी',
  गयी: 'गई',
  नयी: 'नई',
  लिये: 'लिए',
  चाहिये: 'चाहिए',
  दुबारा: 'दोबारा',
  आयेगा: 'आएगा',
  जायेगा: 'जाएगा',
  जरूर: 'ज़रूर',
  ज्यादा: 'ज़्यादा',
  जिंदगी: 'ज़िंदगी',
  ठण्डा: 'ठंडा',
  अन्दर: 'अंदर',
  सुन्दर: 'सुंदर',
};

// The longest sentence (in words) for each grade's own content. Grades 7 and 8 read real prose.
export const MAX_WORDS = { toddler: 8, kg: 10, grade1: 12, grade2: 14, grade3: 18, grade4: 20 };

// Grades 7 and 8 read the Hindi of their schoolbooks: the bookish-word and length rules don't apply,
// but spelling and punctuation still do.
export const EXEMPT_LEVELS = ['grade7', 'grade8'];
