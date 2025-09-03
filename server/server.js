const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3001;
const accountsFilePath = path.join(__dirname, 'accounts.json');

app.use(cors());
app.use(bodyParser.json());

// Helper function to read accounts from the JSON file
const readAccounts = async () => {
  try {
    const data = await fs.readFile(accountsFilePath, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// Helper function to write accounts to the JSON file
const writeAccounts = async (accounts) => {
  await fs.writeFile(accountsFilePath, JSON.stringify(accounts, null, 2), 'utf8');
};


// --- API Endpoints for Account Management ---

// Get all accounts
app.get('/api/accounts', async (req, res) => {
  try {
    const accounts = await readAccounts();
    res.json(accounts);
  } catch (error) {
    console.error("Error reading accounts:", error);
    res.status(500).json({ error: "Failed to read accounts file." });
  }
});

// Add a new account
app.post('/api/accounts', async (req, res) => {
  try {
    const accounts = await readAccounts();
    const newAccount = req.body;
    accounts.push(newAccount);
    await writeAccounts(accounts);
    res.status(201).json(newAccount);
  } catch (error) {
    console.error("Error adding account:", error);
    res.status(500).json({ error: "Failed to add account." });
  }
});

// Update an account
app.put('/api/accounts/:id', async (req, res) => {
  try {
    let accounts = await readAccounts();
    const { id } = req.params;
    const updates = req.body;
    let updatedAccount = null;
    accounts = accounts.map(account => {
      if (account.id === id) {
        updatedAccount = { ...account, ...updates };
        return updatedAccount;
      }
      return account;
    });
    await writeAccounts(accounts);
    if (updatedAccount) {
      res.json(updatedAccount);
    } else {
      res.status(404).json({ error: 'Account not found' });
    }
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ error: "Failed to update account." });
  }
});

// Delete an account
app.delete('/api/accounts/:id', async (req, res) => {
  try {
    let accounts = await readAccounts();
    const { id } = req.params;
    accounts = accounts.filter(account => account.id !== id);
    await writeAccounts(accounts);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ error: "Failed to delete account." });
  }
});

// --- API Endpoint for Checking Account Status ---
app.post('/api/check-status', async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
        return res.status(400).json({ success: false, message: 'apiKey is required' });
    }
    try {
        await axios.get('https://a.klaviyo.com/api/lists', {
            headers: {
                'Authorization': `Klaviyo-API-Key ${apiKey}`,
                'revision': '2023-02-22'
            }
        });
        res.json({ success: true, message: 'Successfully connected to Klaviyo.' });
    } catch (error) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.errors[0]?.detail || "Invalid API Key or connection issue.";
        res.status(statusCode || 500).json({
            success: false,
            message: errorMessage,
            statusCode: statusCode
        });
    }
});

// --- API Endpoint for getting lists ---
app.get('/api/lists/:accountId', async (req, res) => {
    const { accountId } = req.params;
    const accounts = await readAccounts();
    const account = accounts.find(acc => acc.id === accountId);

    if (!account) {
        return res.status(404).json({ error: 'Account not found' });
    }

    try {
        const response = await axios.get('https://a.klaviyo.com/api/lists', {
            headers: {
                'Authorization': `Klaviyo-API-Key ${account.apiKey}`,
                'revision': '2023-02-22'
            }
        });
        const lists = response.data.data.map(list => ({
            id: list.id,
            name: list.attributes.name
        }));
        res.json(lists);
    } catch (error) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.errors[0]?.detail || "Failed to fetch lists from Klaviyo.";
        console.error("Klaviyo API Error:", errorMessage);
        res.status(statusCode || 500).json({ error: errorMessage });
    }
});


// --- FINAL CORRECTED ENDPOINT: Add Subscriber to List ---
app.post('/api/add-subscriber', async (req, res) => {
    const { email, listId, accountId } = req.body;

    if (!accountId || !listId || !email) {
        return res.status(400).json({ error: 'Email, List ID, and Account ID are required' });
    }

    const accounts = await readAccounts();
    const account = accounts.find(acc => acc.id === accountId);

    if (!account) {
        return res.status(404).json({ error: 'Account not found' });
    }

    const headers = {
        'Authorization': `Klaviyo-API-Key ${account.apiKey}`,
        'revision': '2023-02-22',
        'Content-Type': 'application/json'
    };

    try {
        // Step 1: Create the profile. This will also update an existing profile.
        const profileResponse = await axios.post(
            'https://a.klaviyo.com/api/profiles',
            {
                data: {
                    type: 'profile',
                    attributes: {
                        email: email
                    }
                }
            },
            { headers }
        );

        const profileId = profileResponse.data.data.id;

        // Step 2: Subscribe the new profile to the selected list, which gives consent.
        await axios.post(
            `https://a.klaviyo.com/api/lists/${listId}/relationships/profiles`,
            {
                data: [
                    {
                        type: 'profile',
                        id: profileId
                    }
                ]
            },
            { headers }
        );

        res.json({ success: true, message: `Successfully added ${email} to the list.` });

    } catch (error) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.errors?.[0]?.detail || "An error occurred with the Klaviyo API.";
        res.status(statusCode || 500).json({
            success: false,
            message: errorMessage,
            statusCode: statusCode
        });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});