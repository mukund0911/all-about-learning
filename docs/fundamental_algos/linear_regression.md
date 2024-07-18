---
layout: default
title: Linear Regression
parent: Fundamental Algorithms
nav_order: 2
mathjax: true
---

# Configuration
{: .no_toc }

Just the Docs has some specific configuration parameters that can be defined in your Jekyll site's \_config.yml file.
{: .fs-6 .fw-300 }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Applicability

## Definition
As the name implies, linear regression model is a very straightforward approach of predicting the output variable $$y$$ based on a linear combination of input variables $$\boldsymbol{x} = x_1, \cdots, x_M$$ . Mathematically, 

$$
\begin{align}
y \approx \beta_0 + \sum_{m=1}^M \beta_m \cdot x_m,
\label{Defn: Linear Regression}
\end{align}
$$ 

where $$\beta_0$$ is the bias (also known as *intercept* in simple linear regression) parameter, and the coefficient $$\beta_i$$ quantifies the association between the input variable $$X_i$$ and the output variable $$Y$$, for all $$i = 1, \cdots, m$$. Linear models *assumes* that there is approximately a linear relationship between $$x$$ and $$y$$. However, a lienar relationship is rarely observed in reality. Hence, the equation (1) is read as *"the output variable $$y$$ is approximately ($$\approx$$) modelled as"*. Typically, the regression coefficients $$\beta_0, \beta_1, \cdots, \beta_M$$ are unknown and must be estimated. 

### Estimating the Coefficients

The objective is to obtain coefficient estimates $$\hat{\beta}_0, \hat{\beta}_1, \cdots, \hat{\beta}_M$$ such that the linear model fits to the training dataset $$\mathcal{D} = \{(x_1, y_1), \cdots, (x_N, y_N)\}$$ with $$N$$ observations. In other words, the coefficient estimates has to be obtained such that the resulting linear line is as *close* as possible to $$N$$ observations. Given the coefficient estimates, the predicted output variable is given as

$$
\begin{align}
\hat{y}_i = \hat{\beta}_0 + \sum_{m=1}^M \hat{\beta}_m \cdot x_{im}.
\label{Defn: Estm. Linear Regression}
\end{align}
$$ 

There are several ways to measure the *closeness*.

1. Least Squares

2. Ridge Regression

3. Lasso





### Limitations

## Accuracy of the Estimates

## Relation between Simple and Multiple Linear Models
