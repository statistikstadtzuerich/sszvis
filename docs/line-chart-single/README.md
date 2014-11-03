# Einfache Liniendiagramme




## Simple Line Chart

### Datenformat

Dieses Chart benötigt zwei Datenreihen:

* x-Achse
* y-Achse

### Konfiguration

Es stehen folgende Konfigurationsmöglichkeiten zur Verfügung:

* `xAxis` – eine `d3`-Achsenfunktion
* `yAxis` – eine `d3`-Achsenfunktion

## Simple Line Chart

Ein Liniendiagramm eignet sich, um die – meistens zeitliche – Veränderung eines Wertes darzustellen.

```project
{
    "name": "line-chart-single-quarterly",
    "files": {
        "index.html": {
            "source": "docs/line-chart-single/quarterly.html",
            "template": "docs/template.html"
        },
        "data.csv": "docs/line-chart-single/data/SL_quarterly.csv",
        "sszvis.js": "sszvis.js",
        "sszvis.css": "sszvis.css",
        "d3.js": "vendor/d3/d3.min.js"
    },
    "sourceView": ["index.html", "data.csv"],
    "size": {
        "width": 500,
        "height": 480
    }
}
```

## Interaktiv

```project
{
    "name": "line-chart-single-interactive",
    "files": {
        "index.html": {
            "source": "docs/line-chart-single/interactive.html",
            "template": "docs/template.html"
        },
        "data.csv": "docs/line-chart-single/data/SL_quarterly.csv",
        "sszvis.js": "sszvis.js",
        "sszvis.css": "sszvis.css",
        "d3.js": "vendor/d3/d3.min.js"
    },
    "sourceView": ["index.html", "data.csv"],
    "size": {
        "height": 442,
        "width": 516
    }
}
```

## Statisch

```project
{
    "name": "line-chart-single-daily",
    "files": {
        "index.html": {
            "source": "docs/line-chart-single/daily.html",
            "template": "docs/template.html"
        },
        "data.csv": "docs/line-chart-single/data/SL_daily.csv",
        "sszvis.js": "sszvis.js",
        "sszvis.css": "sszvis.css",
        "d3.js": "vendor/d3/d3.min.js"
    },
    "sourceView": ["index.html", "data.csv"],
    "size": {
        "width": 500,
        "height": 450
    }
}
```

```project
{
    "name": "line-chart-single-negatives-x-axis",
    "files": {
        "index.html": {
            "source": "docs/line-chart-single/negatives-x-axis.html",
            "template": "docs/template.html"
        },
        "data.csv": "docs/line-chart-single/data/SL_negativesXAxis.csv",
        "sszvis.js": "sszvis.js",
        "sszvis.css": "sszvis.css",
        "d3.js": "vendor/d3/d3.min.js"
    },
    "sourceView": ["index.html", "data.csv"],
    "size": {
        "width": 500,
        "height": 450
    }
}
```

```project
{
    "name": "line-chart-single-percentage-negatives-y-axis",
    "files": {
        "index.html": {
            "source": "docs/line-chart-single/percentage-negatives-y-axis.html",
            "template": "docs/template.html"
        },
        "data.csv": "docs/line-chart-single/data/SL_Percentage_negativesYAxis.csv",
        "sszvis.js": "sszvis.js",
        "sszvis.css": "sszvis.css",
        "d3.js": "vendor/d3/d3.min.js"
    },
    "sourceView": ["index.html", "data.csv"],
    "size": {
        "width": 500,
        "height": 450
    }
}
```
