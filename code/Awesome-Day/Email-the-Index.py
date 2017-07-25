
# coding: utf-8

# ## Email the Awesome day Index
# 
# A script to fetch the latest awesome day index and send it to all emails from a txt file

# In[3]:

import requests
import os


# In[10]:

#Fetch the latest file entry
#path = os.path.join(os.getcwd(), "latest.txt")
with open("latest.txt", 'r') as f:
    today_text = f.read()


# In[11]:

#Add some info to the mail body
mail_text = today_text + "\n\nThe Awesomeness Index was sent to you by simon-pinkmartini as projectwork for the Lede Progrmme."


# In[12]:

mail_text


# In[13]:

#This function uses mailgun's API
def send_index(email):
    return requests.post(
        "https://api.mailgun.net/v3/sandboxd3009bfa66c448a99ef04d4d3f1dc3fb.mailgun.org/messages",
        auth=("api", "key-6ebb7703ebf2b34fbc21dd11b50efab4"),
        data={"from": "Awesomeness Index <postmaster@sandboxd3009bfa66c448a99ef04d4d3f1dc3fb.mailgun.org>",
              "to": email,
              "subject": "New Awesomeness Index is here!",
              "text": mail_text})


# In[14]:

#All the emails are stored in a file
#path = path = os.path.join(os.getcwd(), "emails/emails.txt")
with open('emails/emails.txt', 'r') as f:
    emails = f.readlines()


# In[15]:

#Sending the mail to all addresses
for email in emails:
    send_index(email)


# In[ ]:



