const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const defaultFaqs = [
  { q: "How long is the dispatch protocol?", a: "Standard deployment takes 2-4 cycles (days). International synchronization may vary." },
  { q: "Can I return an artifact?", a: "We offer 30-day vault returns for unworn pieces in original modular packaging." },
  { q: "Where can I find the size chart?", a: "Detailed dimensions are available on each unit detail page under 'Technical Data'." },
  { q: "What secure gateways are accepted?", a: "We accept Pakasir (QRIS & VA), Bank Vault Transfer, and major Credit Nodes." }
];

async function fixFaqs() {
  console.log("Fetching site settings for 'landing_content'...");
  const { data, error } = await supabase.from('site_settings').select('*').eq('key', 'landing_content').single();
  
  if (error) {
    console.error("Error fetching settings:", error);
    return;
  }

  const landingContent = data.value || {};
  if (landingContent.faqs && JSON.stringify(landingContent.faqs).toLowerCase().includes("aaaaa")) {
    console.log("Found corrupted FAQs (lowercase). Resetting to default...");
    landingContent.faqs = defaultFaqs;
    
    // Update using 'key' instead of 'id'
    const { error: updateError } = await supabase
      .from('site_settings')
      .update({ value: landingContent })
      .eq('key', 'landing_content');

    if (updateError) {
      console.error("Error updating settings:", updateError);
    } else {
      console.log("FAQs successfully reset to default.");
    }
  } else {
    console.log("No corrupted FAQs found in database.");
  }
}

fixFaqs();
