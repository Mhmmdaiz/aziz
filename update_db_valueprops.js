const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const newValueProps = {
  title: "NOT FOR EVERYONE. ONLY FOR THE ELITE.",
  items: [
    {
      icon: "FiBox",
      title: "PREMIUM_ARMOR",
      desc: "24oz Industrial-grade heavyweight cotton. Engineered for structural dominance and lifetime durability.",
    },
    {
      icon: "FiTarget",
      title: "THE_LIMITED_VOID",
      desc: "Micro-batch production: 50 units worldwide. Individually numbered. No restocks, no second chances.",
    },
    {
      icon: "FiZap",
      title: "BRUTAL_AESTHETICS",
      desc: "A fusion of raw industrial horror and high-end silhouette. Designed for the fringe, not the mass.",
    },
    {
      icon: "FiHexagon",
      title: "TACTICAL_UNBOXING",
      desc: "Vacuum-sealed sustainable logistics. Zero-waste packaging engineered for a premium tactile reveal.",
    },
  ],
};

async function updateSettings() {
  // Ambil data landing_content yang ada sekarang
  const { data: currentData } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'landing_content')
    .single();

  if (currentData) {
    const updatedValue = {
      ...currentData.value,
      value_props: newValueProps
    };

    const { error } = await supabase
      .from('site_settings')
      .update({ value: updatedValue })
      .eq('key', 'landing_content');

    if (error) {
      console.error('Error updating settings:', error);
    } else {
      console.log('Successfully updated value_props in DB.');
    }
  }
}

updateSettings();
