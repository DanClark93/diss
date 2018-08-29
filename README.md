# newslabs-radiodicer

<img src=https://github.com/bbc/newslabs-radiodicer/raw/master/radiodicer2large.png width=200 alt="RADIO DICER Mission Patch">

Experiments in automated segmentation of radio programmes, based on prepared scripts.

We have a few objectives for the project.

* A self-contained micro-service API, hosted in a bare-minimal Docker container, that responds to the end-point `/rundown-align`.
* The `/rundown-align` service should accept a POST of the following JSON object. For info, the `words` array is copied as-is from a regular BBC-Kaldi transcript JSON - for example, as produced by `http://apis.labs.jupiter.bbc.co.uk/kaldi-simple/octo:e2304432-cdbf-4724-9313-8e117b20f506`. It should be possible for output from other transcript-generation services, such as those sold by Amazon, Azure or IBM Watson, to be conformed to the simpler `words` array shown below. The `rundown` array is expected to be produced by using (at least in a BBC News context), output from the BBC's OpenMedia REST service, transformed to the distilled `rundown` schema shown.

In order to process a programme for alignment, you can use the `kali-simple_with_enpshtml` endpoint, which takes an Octo transcript output as a path parameter and an ENPS rundown HTML file in the body. For example:

```
curl --noproxy '*' -H 'Content-Type: application/json' -X POST http://apis.labs.jupiter.bbc.co.uk/kaldi-simple_with_enpshtml/octo:<OCTO UUID>?rundown-align --data-binary "@<LOCAL_ENPS_RUNDOWN.HTML>"
```

We've made a few assumptions:

* To implementation the API using Javascript.

* To host the API behind http://apis.labs.jupiter.bbc.co.uk/rundown-align - which will be configured to forward POST data to a docker container (a container based on `node:carbon-slim`).

* In the schema below, the `vpid` value used represents the BBC's `version` identifier for the broadcast concerned. The `vpid` is used throughtout a number of BBC systems to refer to the same programme, so it makes sense for us to persist that `primary key` through our alignment service. Importantly, `vpid` is used as a primary key in the BBC's Programme Segments system.

```
{
	"vpid": "SJ3j82d",
	"words": [{
			"start": 0,
			"confidence": 0.95,
			"end": 0.17,
			"word": "you're",
			"punct": "You're",
			"index": 0
		},
		{
			"start": 0.17,
			"confidence": 1,
			"end": 0.6,
			"word": "listening",
			"punct": "listening",
			"index": 1
		},
		{
			"start": 0.6,
			"confidence": 1,
			"end": 0.71,
			"word": "to",
			"punct": "to",
			"index": 2
		}
	],
	"rundown": [{
			"story": "BONGS",
			"script": ""
		},
		{
			"story": "HEADLINES",
			"script": "BBC News at six o'clock. This is Alan Smith Good evening.\nThe government has published its \"backstop\" plan for trade with the EU after Brexit but only after the inclusion of an \"expected\" end date of 2021.  This followed crunch meetings between Theresa May and the Brexit Secretary David Davis, who insisted a cut-off date be included.\nSix thousand jobs are at risk after House of Fraser announced it will close more than half its stores. \nThe Supreme Court has rejected a challenge to Northern Ireland's abortion laws, despite a majority of the judges saying they are incompatible with human rights. \nThe Metropolitan Police says it's carrying out a criminal investigation into the \"stay put\" policy followed by the London Fire Brigade during the Grenfell Tower fire."
		},
		{
			"story": "Q Brexit 1",
			"script": "After 24 hours of heightened political drama -- in which the Brexit secretary, David Davis, had threatened to quit -- the government has published its fallback plan to avoid a hard border in Northern Ireland.  Theresa May held a series of one-to-one meetings with senior cabinet colleagues to ensure their support.  The prime minister told reporters the important thing was that a policy had been agreed.  Ministers decided that if no permanent customs deal is agreed before Brexit, a temporary arrangement should not remain beyond December 2021.  But the EU has already cast doubt on the backstop proposal.  Our first report is from our assistant political editor, Norman Smith:"
		}
	]
}
```

* The `/rundown-align` service should process the two inputs (the transcript and the rundown) and produce a single JSON object that contains *all* the properties of the incoming JSON, together with two additional properties per rundown story: `start` and `end`. These fields are `floats`, representing `time-in-seconds`, as matched in the supplied transcript.

```
{
	"vpid": "SJ3j82d",
	"words": [{
			"start": 0,
			"confidence": 0.95,
			"end": 0.17,
			"word": "you're",
			"punct": "You're",
			"index": 0
		},
		{
			"start": 0.17,
			"confidence": 1,
			"end": 0.6,
			"word": "listening",
			"punct": "listening",
			"index": 1
		},
		{
			"start": 0.6,
			"confidence": 1,
			"end": 0.71,
			"word": "to",
			"punct": "to",
			"index": 2
		}
	],
	"rundown": [{
			"story": "BONGS",
			"script": "",
			"start": 5.21,
			"end": 18.0
		},
		{
			"story": "HEADLINES",
			"script": "BBC News at six o'clock. This is Alan Smith Good evening.\nThe government has published its \"backstop\" plan for trade with the EU after Brexit but only after the inclusion of an \"expected\" end date of 2021.  This followed crunch meetings between Theresa May and the Brexit Secretary David Davis, who insisted a cut-off date be included.\nSix thousand jobs are at risk after House of Fraser announced it will close more than half its stores. \nThe Supreme Court has rejected a challenge to Northern Ireland's abortion laws, despite a majority of the judges saying they are incompatible with human rights. \nThe Metropolitan Police says it's carrying out a criminal investigation into the \"stay put\" policy followed by the London Fire Brigade during the Grenfell Tower fire.",
			"start": 18.0,
			"end": 184.25
		},
		{
			"story": "Q Brexit 1",
			"script": "After 24 hours of heightened political drama -- in which the Brexit secretary, David Davis, had threatened to quit -- the government has published its fallback plan to avoid a hard border in Northern Ireland.  Theresa May held a series of one-to-one meetings with senior cabinet colleagues to ensure their support.  The prime minister told reporters the important thing was that a policy had been agreed.  Ministers decided that if no permanent customs deal is agreed before Brexit, a temporary arrangement should not remain beyond December 2021.  But the EU has already cast doubt on the backstop proposal.  Our first report is from our assistant political editor, Norman Smith:",
			"start": 184.25,
			"end": 204.12
		}
	]
}
```

* As described, we hope to publish these segments are subsequently published into BBC Digital's (or is it Platform?) https://confluence.dev.bbc.co.uk/display/SegmentAPI/Programme+Segments+API service - which is the public facing segments database as used by iPlayer, BBC Sound, and any other "timed-chapters/segments" system. This API uses `vpid` as a primary key. From my research, the `vpid` value could be anything, as long as it's unique to the set of segments being defined. Further customer-facing experiences can be built on this data-set.

* We should consider building a web interface that permits programmes not 'manufactured' using a traditional rundown management system (such as ENPS, OpenMedia or TIPS), that allows users to paste a body of text (for example from a MS Word document) and annotate it with 'chapter' markers.

* We should perhaps consider using Media Selector (https://confluence.dev.bbc.co.uk/display/MediaSelector/Media+Selector+Select+API) to source media files? This API uses `vpid`.

* We track our project using Trello, at https://trello.com/b/mpIBi3cL/team-radio-dicer

* Our confluence documentation can be found at https://confluence.dev.bbc.co.uk/display/newslabs/Radio+Dicer

* We intend to acquire rundown data from OpenMedia, and in the short-term, ENPS.
** The *test* OpenMedia server address is https://fgbw1mfncs6005/OMAnyPlace/Authentication/Account/LogOn
** The *production* OpenMedia server is https://home.openmedia.bbc.co.uk/
