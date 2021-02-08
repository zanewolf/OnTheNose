# On The Nose

## Overview 
This is a #100DaysofCode project to visualize data from Hans Florine's book On The Nose. In Appendix B, he has a log of the date, partners' names, the time the climb took, and if the climb set any records. 

I decided to visualize this data project first because I have several climbing-focused projects on my idea list, and this is the only one where the data came to me (the book was a gift), and all I had to do was transcribe it to excel. 

At this point, the format of the datavis is a bubble chart, a la [Jim Vallandinghma's 'Creating Bubble Charts with D3V4'](https://vallandingham.me/bubble_charts_with_d3v4.html). I've never made this type of vis before and I'm looking forward to the challenge. 


## Project Plan
- Background and Motivation
	- Pure curiosity and interest in making a bubble chart. 
- Related Work or Inspiration
- Audience
	- What do they know? What are their interests? What visualization literacy do they have? etc.
		- This work is intended for a climbing audience that is familiar with the race for the nose record and Hans Florine. 
    - I might consider adding a pop-up intro as a primer, that would familiar the reader with the context of this data. 
- Questions
	- How many climbs of the 100+ recorded in the book were record-setting, and of what record? 
	- Is there a correlation between time and number of partners? 
  - When did the record-setting climbs occur, year/month? 
- Data
	- Hand-collected from the appendix in On The Nose
- Data Cleanup 
	- Date formats vary between simply Month/Year and specific Day/Month/Year, so I won't be able to show data beyond the month level of detail. 
  - Timing reports likewise vary between specific Hours:Minutes:Seconds to "About 3 days". In the circumstances where time is not given in hours, I will round to the closest interval of 24 (.e.g 'about 3 days' = 72:00:00)
- What is the final product? 
	- A bubble chart that the viewer can step through, which will sort the climbs (individual bubbles) according to whatever factor the user has chosen (year/month/number of partners/ record-setting/etc). 


