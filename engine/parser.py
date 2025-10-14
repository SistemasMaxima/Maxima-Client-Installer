import sys
import json
import csv
import re

baseLink = "https://www.paquetexpress.com.mx/rastreo/"
links = []
trackNum = []
jsonFile = "../data/data.json"
allInfo = {}
data = {"totalTrackNumbers":"", "totalLinks":0, "links": []}#{"totalTrackNumbers": obj['totalTrackNumbers'], "totalLinks": len(obj["links"]), "links": []}

def makeJson(obj):
    #try:
    #    with open(jsonFile, 'r') as f:
    #        data = json.load(f)
    #except FileNotFoundError:
    with open(jsonFile, 'w') as f:
        json.dump(data, f, indent=4)

def makeLink():
    totalTrackNums = len(trackNum)
    globalTrackingNumberAppended = 0
    totalLinks = 0
    
    # The main 'links' list for URLs is built inside the loop now
    built_links_urls = []

    # Loop as long as there are tracking numbers to process
    while globalTrackingNumberAppended < totalTrackNums:
        
        # 1. Create a NEW dictionary and list for EACH link inside the loop
        link_details = {}
        current_link_track_numbers = []
        localTrackNumbersAppended = 0

        # Build a single link with up to 30 tracking numbers
        while (localTrackNumbersAppended < 30) and (globalTrackingNumberAppended < totalTrackNums):
            # Add the current tracking number to our list for this specific link
            current_track_num = trackNum[globalTrackingNumberAppended]
            current_link_track_numbers.append(current_track_num)
            
            globalTrackingNumberAppended += 1
            localTrackNumbersAppended += 1
        
        # 2. Construct the full URL string from the numbers collected for this link
        link_url = baseLink + "-".join(current_link_track_numbers)
        built_links_urls.append(link_url)

        # 3. Populate the NEW dictionary with the correct data
        link_details['link'] = link_url
        link_details['trackNumbersCount'] = len(current_link_track_numbers)
        link_details['trackNumbers'] = current_link_track_numbers # Assign the list of numbers

        # 4. Append the unique dictionary to the main data structure
        data['links'].append(link_details)
        totalLinks += 1

    # Update the total counts at the end
    data['totalTrackNumbers'] = globalTrackingNumberAppended
    data['totalLinks'] = totalLinks

def getTrackAllNums(path):
    with open(path, "r") as file:
        data = csv.DictReader(file)
        num = 0
        for line in data:
            if (re.search("MTY", line['OUTBOUND TRACKING']) != None) or (line['PAQUETERIA'] == "PAQUETE EXPRESS"): 
                trackingNumber = line['OUTBOUND TRACKING']
                #print(trackingNumber)
                matches = re.findall("(MTY.*)(001001)", trackingNumber)
                trackNum.append(matches[0][0])
                num += 1 
        #print(f"There is {num} track numbers")

def main():
    numArg = 0
    filePath = None
    for arg in sys.argv:
        #print("Arg: ", arg)
        if arg == "-f":
            filePath = sys.argv[numArg + 1]
        numArg += 1

    if None == filePath:
        print("That is not the usage method")
        sys.exit(1)

    #filePath = "../data/MAXIMAS WAREHOUSE - ENTRADAS.csv"
    getTrackAllNums(filePath)
    makeLink()
    #for i in links:
        #print(i)
    makeJson(allInfo)
    
    
    

if __name__ == "__main__":
    main()
    print(data)
    sys.exit(0)