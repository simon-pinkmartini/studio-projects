
# coding: utf-8

# # Awesome Day Index
# 
# This code calls a couple of APIs that update on a daily basis.
# 
# Based on the information, it calculates an index that tells us how awesome this day is going to be!

# In[16]:

import requests
from bs4 import BeautifulSoup
import numpy as np
import datetime
import os


# ## Define a data structure for our Awesome Day Index

# In[2]:

#Our Awesome Day Index will be calculated an average of many indices.
class index:
    
    #An instruction of how to translate values into words
    awesomeness_types = [
        {'minvalue': 0, 'adjective': 'totally awful', 'sentence': "But hey, at least it can't get worse."},
        {'minvalue': 10, 'adjective': 'miserable', 'sentence': "Better go straight back to bed!"},
        {'minvalue': 20, 'adjective': 'bad', 'sentence': "Good luck, you will need it!"},
        {'minvalue': 30, 'adjective': 'mediocre', 'sentence': "Better buy yourself some chocolate!"},
        {'minvalue': 40, 'adjective': 'decent', 'sentence': "Consider the glass almost half full."},
        {'minvalue': 50, 'adjective': 'quite okay', 'sentence': "Watch out for unexpected luck!"},
        {'minvalue': 60, 'adjective': 'pretty good', 'sentence': "Time to get bullish!"},
        {'minvalue': 70, 'adjective': 'sweet', 'sentence': "Today could totally be your day!"},
        {'minvalue': 80, 'adjective': 'fantastic', 'sentence': "Hakuna matata, way to go!"},
        {'minvalue': 90, 'adjective': 'absolutely awesome', 'sentence': "Let's rock!"},
    ]
    
    def __init__(self):
        #The Name of this index
        self.name = "Awesome Index"
        #The value of the index (between 0 and 100)
        self.value = 0.0
        #The adjective describing the day
        self.adjective = ""
        #A sentence to give more color
        self.sentence = ""
        #The list of subindices
        self.subindices = []
        
    def add(self, subindex):
        #Add the subindex to the list
        self.subindices.append(subindex)
        #Update the index base on the values of the subindices
        self.update()
        
    def update(self):    
        #Calculate the average value
        values = []
        for subindex in self.subindices:
            values.append(subindex.value)
        if len(values) > 0:
            self.value = np.mean(values)
        #Choose an adjective based on the value
        for awesomeness_type in index.awesomeness_types:
            if self.value >= awesomeness_type['minvalue']:
                self.adjective = awesomeness_type['adjective']
                self.sentence = awesomeness_type['sentence']
                
    def to_text(self):
        text = "Today's awesomness index is " + str('%d' % (round(self.value ,0))) + ".\nLife is " + self.adjective + "!"
        for subindex in self.subindices:
            text += " " + subindex.message
        text += " " + self.sentence
        return text


# In[3]:

#Each index has a set of attributes and functions
class subindex:
    def __init__(self):
        #The status of the index - set to "good" after populating
        self.status = "bad"
        #A Title for this index
        self.name = ""
        #The value has to be set between 0 and 100
        self.value = 0.0
        #A message to attach to the latest value
        self.message = ""


# ## Initialize the Awesome Index 

# In[4]:

awesomeindex = index()


# ## Populate the Index with many sub-indices

# ### A subindex for today's weekday

# In[5]:

#Initialize the subindex
weekday_subindex = subindex()


# In[6]:

#Get the current time
timenow = datetime.datetime.now()
weekday = timenow.strftime("%w" )
weekday_name = timenow.strftime("%A" )


# In[7]:

#Here's the matrix for awesomeness and weekdays
day_awesomeness = {
    0: 80,
    1: 0,
    2: 0,
    3: 20,
    4: 50,
    5: 75,
    6: 100
}


# In[8]:

#Asign the awesomeness value base on the matrix
weekday_subindex.value = day_awesomeness[int(weekday)]
weekday_subindex.message = "Today is " + weekday_name + "."
weekday_subindex.status = "good"


# In[9]:

#Depending on the status, we will add the subindex or not
if weekday_subindex.status == "good":
    awesomeindex.add(weekday_subindex)


# ### A subindex for the weather in New York!

# In[10]:

#Initialize the subindex
weather_subindex = subindex()


# In[11]:

#We can use the Dark Sky API for this
api_url = "https://api.darksky.net/forecast/"
api_key = "d2742358d5756e9f3358aa5a4ddad873"
Y_coord = 40.785091
X_coord = -73.968285
url = api_url + api_key + "/" + str(Y_coord) + "," + str(X_coord)


# In[12]:

try:
    #Make API Call
    response = requests.get(url)
    data = response.json()
    
    #Get a couple of data points
    forecast_for_today = data['daily']['data'][0]
    rain = forecast_for_today['precipProbability'] #between 0 and 1 

except (ConnectionError, KeyError):
    pass

else:
    
    #FOR LATER...
    #clouds = forecast_for_today['cloudCover'] #between 0 and 1
    #temp = forecast_for_today['apparentTemperatureMax'] #between 0 and 1
    
    #Calculate a weather subindex
    weather_subindex.value = (1 - rain) * 100
    
    #Add a message
    weather_subindex.message = "There is a " + str('%d' % (round(rain * 100, 0))) + " percent chance of rain."
    
    #If we got until here, the status is good!
    weather_subindex.status = "good"


# In[13]:

#Depending on the status, we will add the subindex or not
if weather_subindex.status == "good":
    awesomeindex.add(weather_subindex)


# ## Output the index to a textfile

# In[25]:

#Call the text function from the index class
today_text = awesomeindex.to_text()
today_text


# In[26]:

#Write to the latest file entry
#path = os.path.join(os.getcwd(), "latest.txt")
with open('latest.txt', 'w') as f:
    f.write(today_text)


# In[27]:

#Prepare a timestamp for the filename
datestring = datetime.datetime.now().strftime("%Y-%m-%d")
archivefile = "archive/awesomeindex-" + datestring + ".txt"


# In[28]:

#Write to the archive
#path = os.path.join(os.getcwd(), archivefile)
with open(archivefile, 'w') as f:
    f.write(today_text)


# In[ ]:



