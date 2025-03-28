require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
const mql = require("@microlink/mql");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// API to fetch metadata and store in Supabase
app.post("/fetch-metadata", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const { status, data, response, error } = await mql(url, {
      meta: true,
      screenshot: true,
    });

    // Save to Supabase
    const { data: supabaseData, error: supabaseError } = await supabase
      .from("website_metadata")
      .insert([
        {
          url,
          name: data.title,
          description: data.description,
          company_logo: data.logo.url,
          screenshot: data.screenshot.url,
        },
      ]);

    if (supabaseError) throw supabaseError;
    return res
      .status(201)
      .json({ message: "Metadata saved successfully", data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// API to get all saved website metadata
app.get("/metadata-list", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("website_metadata")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch metadata list" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
