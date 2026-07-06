// Yeh blog posts ka data hai. Filhal yeh static data hai (database se connected
// nahi) — jab aap real blog content likhna shuru karein, isi array mein naye
// posts add kar sakte hain, ya future mein Blog model (src/models/Blog.js)
// se connect kiya ja sakta hai.

export const blogPosts = [
  {
    id: 1,
    title: 'Best Deworming Medicine for Dogs in Pakistan',
    slug: 'best-deworming-medicine-for-dogs',
    excerpt: 'Complete guide to choosing the right deworming medicine for your dog based on age, weight and breed.',
    category: 'Dog Care',
    date: 'May 18, 2024',
    image: '🐕',
    author: 'Admin',
    content: [
      'Deworming your dog regularly is one of the most important parts of responsible pet ownership. Intestinal worms can cause serious health problems if left untreated, ranging from mild digestive upset to severe weight loss and anemia.',
      'In Pakistan, the most common worms affecting dogs include roundworms, hookworms, tapeworms, and whipworms. Puppies should be dewormed starting at 2 weeks of age, then every 2 weeks until 12 weeks old, followed by monthly treatments until 6 months.',
      'For adult dogs, deworming every 3 months is generally recommended, though this can vary based on lifestyle factors like outdoor exposure and contact with other animals.',
      'Some of the most trusted deworming medicines available include Drontal Plus, Milbemax, and Panacur. Always consult with your veterinarian before starting any deworming program, especially for puppies, pregnant dogs, or dogs with existing health conditions.',
    ],
  },
  {
    id: 2,
    title: 'Cat Vaccination Schedule: Complete Guide',
    slug: 'cat-vaccination-schedule',
    excerpt: 'Everything you need to know about vaccinating your cat from kitten to adult age.',
    category: 'Cat Care',
    date: 'May 15, 2024',
    image: '🐈',
    author: 'Admin',
    content: [
      'Vaccinating your cat is one of the most effective ways to protect them from serious, often fatal diseases. Kittens typically begin their vaccination series at 6 to 8 weeks of age.',
      'The core vaccines recommended for all cats include FVRCP (feline viral rhinotracheitis, calicivirus, and panleukopenia) and rabies. These protect against the most common and dangerous feline diseases.',
      'Kittens usually need a series of 3 to 4 vaccine doses, spaced 3 to 4 weeks apart, until they are about 16 weeks old. After the initial series, booster shots are typically needed annually or every 3 years depending on the vaccine type.',
      'Always consult your veterinarian to create a vaccination schedule tailored to your cat\'s specific lifestyle, indoor or outdoor exposure, and health history.',
    ],
  },
  {
    id: 3,
    title: 'How to Remove Fleas from Cats at Home',
    slug: 'remove-fleas-from-cats',
    excerpt: 'Simple and effective home remedies combined with vet-approved treatments to get rid of fleas.',
    category: 'Cat Care',
    date: 'May 10, 2024',
    image: '🐈',
    author: 'Admin',
    content: [
      'Fleas are a common problem for cats, especially in warm climates like Pakistan. They cause itching, discomfort, and can lead to more serious issues like anemia or tapeworm infections if left untreated.',
      'The first step in flea removal is bathing your cat with a vet-approved flea shampoo. Follow this with a thorough combing using a fine-toothed flea comb to physically remove fleas and eggs from the fur.',
      'Spot-on treatments like Frontline or Bravecto are highly effective and provide protection for weeks at a time. These are applied directly to the skin, usually at the back of the neck.',
      'Don\'t forget to treat your home environment too — wash your cat\'s bedding regularly and vacuum carpets and furniture, since flea eggs can survive in these areas for weeks.',
    ],
  },
  {
    id: 4,
    title: 'Dog Skin Infection Treatment Guide',
    slug: 'dog-skin-infection-treatment',
    excerpt: 'Identify symptoms of skin infections in dogs and learn the best treatment options available.',
    category: 'Dog Care',
    date: 'May 8, 2024',
    image: '🐕',
    author: 'Admin',
    content: [
      'Skin infections in dogs are a common issue, often caused by bacteria, fungi, allergies, or parasites. Common symptoms include redness, itching, hair loss, scabbing, and an unpleasant odor from the affected area.',
      'Bacterial skin infections (pyoderma) often appear as red bumps or pustules and typically require antibiotic treatment prescribed by a veterinarian. Fungal infections like ringworm can cause circular patches of hair loss.',
      'Allergic skin reactions, whether from food, environmental allergens, or flea bites, are another major cause of skin problems in dogs. Identifying and removing the allergen is key to long-term management.',
      'Medicated shampoos, topical treatments like V Cut Lotion, and in some cases oral medication can help manage symptoms. Always see a vet for a proper diagnosis, as treatment varies significantly based on the underlying cause.',
    ],
  },
  {
    id: 5,
    title: 'Common Bird Diseases and Prevention',
    slug: 'common-bird-diseases',
    excerpt: 'Learn about the most common diseases affecting pet birds and how to prevent them.',
    category: 'Bird Care',
    date: 'May 5, 2024',
    image: '🦜',
    author: 'Admin',
    content: [
      'Pet birds, including parrots, budgies, and finches, are susceptible to a range of diseases, many of which can be prevented with proper care, nutrition, and hygiene.',
      'Respiratory infections are among the most common issues, often caused by poor ventilation, dusty environments, or exposure to other sick birds. Symptoms include labored breathing, discharge from the nostrils, and tail bobbing.',
      'Psittacosis (parrot fever) is a serious bacterial infection that can also affect humans. Regular cage cleaning and quarantining new birds before introducing them to your flock can help prevent its spread.',
      'A balanced diet, clean water, regular cage cleaning, and routine veterinary checkups are the foundation of disease prevention in pet birds. Early detection of symptoms greatly improves treatment outcomes.',
    ],
  },
  {
    id: 6,
    title: 'Best Supplements For Pets in 2024',
    slug: 'best-supplements-for-pets',
    excerpt: 'A complete roundup of the most effective and vet-recommended supplements for pet health.',
    category: 'General',
    date: 'May 1, 2024',
    image: '💊',
    author: 'Admin',
    content: [
      'Pet supplements have become increasingly popular as owners look for ways to support their pets\' overall health beyond regular food. From joint support to skin and coat health, the right supplement can make a real difference.',
      'Omega-3 fatty acid supplements are excellent for skin and coat health, reducing inflammation, and supporting joint mobility, especially in older pets.',
      'Glucosamine and chondroitin supplements are widely recommended for dogs and cats with arthritis or joint issues, helping to maintain cartilage health and reduce discomfort.',
      'Probiotics can support digestive health, especially for pets with sensitive stomachs. Always consult with your veterinarian before starting any new supplement regimen to ensure it\'s appropriate for your pet\'s specific needs.',
    ],
  },
];

export const blogCategories = ['All', 'Dog Care', 'Cat Care', 'Bird Care', 'General'];
