rundowns=[
{
    'name': 'R4SixOClockNews-20180607',
    'rundownjson': 'https://raw.githubusercontent.com/bbc/newslabs-radiodicer/master/examples/R4SixOClockNews-20180607.rundown.json?token=AFnnvgbrBoK4R0Ekk44q36DZWvG0KCsiks5bKni5wA%3D%3D'
},
{
    'name': 'R4SixOClockNews-20180608',
    'rundownjson': 'https://raw.githubusercontent.com/bbc/newslabs-radiodicer/master/examples/R4SixOClockNews-20180608.rundown.json?token=AFnnvvEQAOjZBcgU7yvr8jzLEI78JNmpks5bKnmNwA%3D%3D'
},
{
    'name': 'R4SixOClockNews-20180609',
    'rundownjson': 'https://raw.githubusercontent.com/bbc/newslabs-radiodicer/master/examples/R4SixOClockNews-20180609.rundown.json?token=AFnnvm4gkxuzyzVy3c-W7xGkuR8taRi9ks5bKnn_wA%3D%3D'
},
{
    'name': 'R4SixOClockNews-20180610',
    'rundownjson': 'https://raw.githubusercontent.com/bbc/newslabs-radiodicer/master/examples/R4SixOClockNews-20180610.rundown.json?token=AFnnvtbOv95xH21l4ApNAXxqbyuK_w7Zks5bKnozwA%3D%3D'
}
]


$(function(){
    rundowns.forEach(function(rundown){
        $('#rundowns').append('<li>' + rundown.name + ' <a class=fakea onclick=open_rundown(this) data-ref=' + rundown.rundownjson + '>rundown</a></li>')
    })
})

function open_rundown(link)
{
    var url=$(link).data('ref')
    bbc.Jlog(url)

    fetch(url)
    .then((resp)=>resp.json())
    .then(function(rundown){
        console.log(rundown,rundown.source)
        $('#programme').text(rundown.source)
        $('#stories').html('')
        rundown.retval.stories.forEach(function(story,i){
            $('#stories').append('<li><h5>' + story.story + '</h5>' + story.script.replace(/\n/g, '<br><br>') + '</li>')
        })
    })
}
