queue()
    .defer(d3.csv, "data/StudentsPerformance.csv")
    .await(makeGraphs);


function makeGraphs(error, studentData) {
    var ndx = crossfilter(studentData);

    studentData.forEach(function(d) {
        d.math_score = parseInt(d.math_score);
        d.reading_score = parseInt(d["reading_score"]);
        d.writing_score = parseInt(d["writing_score"]);
    });


    show_percent_of_each_gender(ndx);
    show_gender_balance(ndx);
    show_test_scores_by_gender(ndx);
    show_parental_level_of_education_selector(ndx);
    show_race_ethnicity_balance(ndx);
    show_percent_that_are_in_each_race(ndx);
    show_math_score_to_reading_score_correlation(ndx);
    show_math_score_to_writing_score_correlation(ndx);
    show_reading_score_to_writing_score_correlation(ndx);
    show_math_scores_by_test_prep(ndx);
    show_reading_scores_by_test_prep(ndx);
    show_writing_scores_by_test_prep(ndx);

    dc.renderAll();
}



function show_percent_of_each_gender(ndx) {

    function percentageThatAreEachGender(gender) {
        return genderDim.group().reduce(
            function(p, v) {
                p.total++;
                if (v.gender === gender) {
                    p.count++;
                }
                return p;
            },
            function(p, v) {
                p.total++;
                if (v.gender === gender) {
                    p.count--;
                }
                return p;
            },
            function() {
                return { count: 0, total: 0 };
            }
        );
    }

    var genderDim = ndx.dimension(dc.pluck("gender"));
    var percentageThatAreFemale = percentageThatAreEachGender("female");
    var percentgeThatAreMale = percentageThatAreEachGender("male");

    dc.numberDisplay("#female-number")
        .formatNumber(d3.format(".2%"))
        .valueAccessor(function(d) {
            if(d.value.total > 0) {
                return (d.value.count / d.value.total) * 100
            } else {
                return 0;
            }
            return d.value.percent;
        })
        .group(percentageThatAreFemale);


    dc.numberDisplay("#male-number")
        .formatNumber(d3.format(".2%"))
        .valueAccessor(function(d) {
            if(d.value.total > 0) {
                return (d.value.count / d.value.total) * 100
            } else {
                return 0;
            }
            return d.value.percent * 100;
        })
        .group(percentgeThatAreMale);
}

function show_gender_balance(ndx) {
    var genderColors = d3.scale.ordinal()
        .domain(["Female", "Male"])
        .range(["pink", "blue"]);
    var genderDim = ndx.dimension(function(d) {
        return [d.gender];
    });
    var genderMix = genderDim.group();

    dc.barChart("#gender-balance")
        .width(350)
        .height(250)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .colorAccessor(function(d) { return d.key[0]; })
        .colors(genderColors)
        .dimension(genderDim)
        .group(genderMix)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Gender")
        .yAxis().ticks(20);
}


function show_test_scores_by_gender(ndx) {
    var genderColors = d3.scale.ordinal()
        .domain(["Female", "Male"])
        .range(["pink", "blue"]);
    var genderDim = ndx.dimension(function(d) {
        return [d.gender];
    });
    var math_score_by_gender = genderDim.group().reduceSum(dc.pluck('math_score'));
    var reading_score_by_gender = genderDim.group().reduceSum(dc.pluck('reading_score'));
    var writing_score_by_gender = genderDim.group().reduceSum(dc.pluck('writing_score'));

    dc.pieChart("#gender-balance-math")
        .height(150)
        .radius(75)
        .transitionDuration(500)
        .colorAccessor(function(d) { return d.key[0]; })
        .colors(genderColors)
        .dimension(genderDim)
        .group(math_score_by_gender)

    dc.pieChart("#gender-balance-reading")
        .height(150)
        .radius(75)
        .transitionDuration(500)
        .colorAccessor(function(d) { return d.key[0]; })
        .colors(genderColors)
        .dimension(genderDim)
        .group(reading_score_by_gender)

    dc.pieChart("#gender-balance-writing")
        .height(150)
        .radius(75)
        .transitionDuration(500)
        .colorAccessor(function(d) { return d.key[0]; })
        .colors(genderColors)
        .dimension(genderDim)
        .group(writing_score_by_gender)

}


function show_parental_level_of_education_selector(ndx) {
    var parentDim = ndx.dimension(dc.pluck("parental_level_of_education"));
    var parentSelect = parentDim.group();

    dc.selectMenu("#parental_level_of_education-selector")
        .dimension(parentDim)
        .group(parentSelect);
}


function show_race_ethnicity_balance(ndx) {
    var raceColors = d3.scale.ordinal()
        .domain(["A", "B", "C", "D", "E"])
        .range(["red", "orange", "yellow", "green", "blue"]);
    var race_ethnicityDim = ndx.dimension(function(d) {
        return [d.race_ethnicity];
    });
    var race_ethnicityMix = race_ethnicityDim.group();

    dc.barChart("#race_ethnicity-graph")
        .width(350)
        .height(250)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .colorAccessor(function(d, i) { return i; })
        .colors(raceColors)
        .dimension(race_ethnicityDim)
        .group(race_ethnicityMix)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Race/Ethnicity")
        .yAxis().ticks(5);
}


function show_percent_that_are_in_each_race(ndx) {

    function parental_level_of_education_by_Race(dimension, parental_level_of_education) {
        return dimension.group().reduce(
            function(p, v) {
                p.total++;
                if (v.parental_level_of_education === parental_level_of_education) {
                    p.match++;
                };
                return p;
            },
            function(p, v) {
                p.total--;
                if (v.parental_level_of_education === parental_level_of_education) {
                    p.match--;
                };
                return p;
            },
            function() {
                return { total: 0, match: 0 }
            }
        );
    };

    var dim = ndx.dimension(dc.pluck("race_ethnicity"));
    var someHighSchoolByRace = parental_level_of_education_by_Race(dim, "some high school");
    var highSchoolProfByRace = parental_level_of_education_by_Race(dim, "high school");
    var someCollegeProfByRace = parental_level_of_education_by_Race(dim, "some college");
    var associateDegreeProfByRace = parental_level_of_education_by_Race(dim, "associate's degree");
    var bachelorDegreeProfByRace = parental_level_of_education_by_Race(dim, "bachelor's degree");
    var mastersDegreeProfByRace = parental_level_of_education_by_Race(dim, "master's degree");


    dc.barChart("#parental_level_of_education_by_Race-chart")
        .width(350)
        .height(250)
        .margins({ top: 10, right: 100, bottom: 30, left: 30 })
        .dimension(dim)
        .group(someHighSchoolByRace, "some high school")
        .stack(highSchoolProfByRace, "high school")
        .stack(someCollegeProfByRace, "some college")
        .stack(associateDegreeProfByRace, "associate's degree")
        .stack(bachelorDegreeProfByRace, "bachelor's degree")
        .stack(mastersDegreeProfByRace, "master's degree")
        .valueAccessor(function(d) {
            if (d.value.total > 0) {
                return (d.value.match / d.value.total) * 100
            }
            else {
                return 0;
            }
            return d.value.percent * 100;
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Race/Ethnicity")
        .legend(dc.legend().x(270).y(20).itemHeight(15).gap(5));
}


function show_math_score_to_reading_score_correlation(ndx) {
    var genderColors = d3.scale.ordinal()
        .domain(["Female", "Male"])
        .range(["pink", "blue"]);

    var mathDim = ndx.dimension(dc.pluck("math_score"));
    var scoresDim = ndx.dimension(function(d) {
        return [d.math_score, d.reading_score, d.gender];
    });
    var scoresGroup = scoresDim.group();

    var minMath = mathDim.bottom(1)[0].math_score;
    var maxMath = mathDim.top(1)[0].math_score;

    dc.scatterPlot("#math_vs_reading_scores")
        .width(450)
        .height(300)
        .x(d3.scale.linear().domain([minMath, maxMath]))
        .brushOn(false)
        .symbolSize(8)
        .clipPadding(10)
        .yAxisLabel("Reading Score")
        .xAxisLabel("Math Score")
        .title(function(d) {
            return "This person received " + d.key[0] + " in Math and " + d.key[1] + " in Reading.";
        })
        .colorAccessor(function(d) {
            return d.key[2];
        })
        .colors(genderColors)
        .dimension(scoresDim)
        .group(scoresGroup)
        .margins({ top: 10, right: 50, bottom: 75, left: 75 });
}


function show_math_score_to_writing_score_correlation(ndx) {
    var genderColors = d3.scale.ordinal()
        .domain(["Female", "Male"])
        .range(["pink", "blue"]);

    var mathDim = ndx.dimension(dc.pluck("math_score"));
    var scoresDim = ndx.dimension(function(d) {
        return [d.math_score, d.writing_score, d.gender];
    });
    var scoresGroup = scoresDim.group();

    var minMath = mathDim.bottom(1)[0].math_score;
    var maxMath = mathDim.top(1)[0].math_score;

    dc.scatterPlot("#math_vs_writing_scores")
        .width(450)
        .height(300)
        .x(d3.scale.linear().domain([minMath, maxMath]))
        .brushOn(false)
        .symbolSize(8)
        .clipPadding(10)
        .yAxisLabel("Writing Score")
        .xAxisLabel("Math Score")
        .title(function(d) {
            return "This person received " + d.key[0] + " in Math and " + d.key[1] + " in Writing.";
        })
        .colorAccessor(function(d) {
            return d.key[2];
        })
        .colors(genderColors)
        .dimension(scoresDim)
        .group(scoresGroup)
        .margins({ top: 10, right: 50, bottom: 75, left: 75 });
}


function show_reading_score_to_writing_score_correlation(ndx) {
    var genderColors = d3.scale.ordinal()
        .domain(["Female", "Male"])
        .range(["pink", "blue"]);

    var readingDim = ndx.dimension(dc.pluck("reading_score"));
    var scoresDim = ndx.dimension(function(d) {
        return [d.reading_score, d.writing_score, d.gender];
    });
    var scoresGroup = scoresDim.group();

    var minReading = readingDim.bottom(1)[0].reading_score;
    var maxReading = readingDim.top(1)[0].reading_score;

    dc.scatterPlot("#reading_vs_writing_scores")
        .width(450)
        .height(300)
        .x(d3.scale.linear().domain([minReading, maxReading]))
        .brushOn(false)
        .symbolSize(8)
        .clipPadding(10)
        .yAxisLabel("Writing Score")
        .xAxisLabel("Reading Score")
        .title(function(d) {
            return "This person received " + d.key[0] + " in Reading and " + d.key[1] + " in Writing.";
        })
        .colorAccessor(function(d) {
            return d.key[2];
        })
        .colors(genderColors)
        .dimension(scoresDim)
        .group(scoresGroup)
        .margins({ top: 10, right: 50, bottom: 75, left: 75 });
}


function show_math_scores_by_test_prep(ndx) {
    var testDim = ndx.dimension(dc.pluck("test_preparation_course"));
    var math_by_test_prepGroup = testDim.group().reduce(
        function(p, v) {
            p.count++;
            p.total += v.math_score;
            p.average = p.total / p.count;
            return p;
        },
        //Remove the fact
        function(p, v) {
            p.count--;
            if (p.count == 0) {
                p.total = 0;
                p.average = 0;
            }
            else {
                p.total -= v.math_score;
                p.average = p.total / p.count;
            }
            return p;
        },

        //Initialise the Reducer
        function() {
            return { count: 0, total: 0, average: 0 };
        }
    );


    dc.lineChart("#math-test-chart")
        .width(350)
        .height(250)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(testDim)
        .group(math_by_test_prepGroup)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .valueAccessor(function(d) {
            return d.value.average;
        })
        .elasticY(true)
        .xAxisLabel("Test Prep Course")
        .yAxisLabel("Average Math Score")
        .yAxis().ticks(10)
}

function show_reading_scores_by_test_prep(ndx) {
    var testDim = ndx.dimension(dc.pluck("test_preparation_course"));
    var reading_by_test_prepGroup = testDim.group().reduce(
        function(p, v) {
            p.count++;
            p.total += v.reading_score;
            p.average = p.total / p.count;
            return p;
        },
        //Remove the fact
        function(p, v) {
            p.count--;
            if (p.count == 0) {
                p.total = 0;
                p.average = 0;
            }
            else {
                p.total -= v.reading_score;
                p.average = p.total / p.count;
            }
            return p;
        },

        //Initialise the Reducer
        function() {
            return { count: 0, total: 0, average: 0 };
        }
    );

    dc.lineChart("#reading-test-chart")
        .width(350)
        .height(250)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(testDim)
        .group(reading_by_test_prepGroup)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .valueAccessor(function(d) {
            return d.value.average;
        })
        .elasticY(true)
        .xAxisLabel("Test Prep Course")
        .yAxisLabel("Average Reading Score")
        .yAxis().ticks(10);
}


function show_writing_scores_by_test_prep(ndx) {
    var testDim = ndx.dimension(dc.pluck("test_preparation_course"));
    var writing_by_test_prepGroup = testDim.group().reduce(
        function(p, v) {
            p.count++;
            p.total += v.writing_score;
            p.average = p.total / p.count;
            return p;
        },
        //Remove the fact
        function(p, v) {
            p.count--;
            if (p.count == 0) {
                p.total = 0;
                p.average = 0;
            }
            else {
                p.total -= v.writing_score;
                p.average = p.total / p.count;
            }
            return p;
        },

        //Initialise the Reducer
        function() {
            return { count: 0, total: 0, average: 0 };
        }
    );

    dc.lineChart("#writing-test-chart")
        .width(350)
        .height(250)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(testDim)
        .group(writing_by_test_prepGroup)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .valueAccessor(function(d) {
            return d.value.average;
        })
        .elasticY(true)
        .xAxisLabel("Test Prep Course")
        .yAxisLabel("Average Writing Score")
        .yAxis().ticks(10);
}