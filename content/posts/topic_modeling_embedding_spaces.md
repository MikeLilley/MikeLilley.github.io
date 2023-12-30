---
author: "Michael Lilley"
title: "Topic Modeling in Embedding Spaces"
date: "2023-05-28"
description: "In this post, we will be going over the paper Topic Modeling in Embedding Spaces by Dieng et al., with an extended explanation of the background content."
summary: "In this post, we will be going over the paper Topic Modeling in Embedding Spaces by Dieng et al., with an extended explanation of the background content."
tags: ["topic-modeling", "word-embeddings", "statistics", "natural-language-processing"]
cover:
    image: topic_modeling_cover.png # image path/url
    hidden: true
---

---



## Introduction

<p>There is a paper I studied as part of my undergraduate research titled <i>Topic Modeling in Embedding Spaces</i> by Dieng et al.; researchers based out of Columbia University. I particularly liked this work, and thought an article which goes over the content with additional explanation was appropriate for a post. In the following sections, we're going to be covering the prerequisites needed to understand the <i>Embedded Topic Model</i>, the ETM itself, as well as subsequent sections concerning variational inference using ELBO and the corresponding empirical study done to evaluate the model on real-world data.</p>

---

## Topic Modeling

<p>We define a <i>topic model</i> as a statistical model meant to characterize documents in terms of their topics. Given only a collection of documents and the words in the documents, such a model would attempt to extract the latent topics and then use them to describe the documents. A <i>topic</i> is defined as a cluster of words which appear frequently together in documents. For help with an intuitive understanding, consider the following toy example:</p>

><p><b>Example 1.1:</b> Let our collection of documents be defined as \(\mathcal{D} = \lbrace D_1,D_2,D_3 \rbrace ,\) each containing the following content:</p>
><div data-simplebar>
><ul>
><li>\( D_1 = \lbrace \mbox{The quick brown fox jumped over the lazy dog.} \rbrace \)</li>
><li>\( D_2 = \lbrace \mbox{The dog and hare were distraught when the fox won the race.} \rbrace \)</li>
><li>\( D_3 = \lbrace \mbox{Baseball and racing are two of my favorite sports.} \rbrace \)</li>
></ul>
></div>
><p>Consider a very simple topic model \(\mathcal{M},\) which performs part-of-speech tagging for each word in a document, extracts the nouns and performs lemmatization, clusters words based on mutual presence in a document, then maps each document to a vector \(\vec{v} \in \mathbb{R}^n\) whose entries sum to 1, with \(n\) being the total number of distinct topics extracted from all documents. </p>
><p>In this model, each element of the vector represents the proportion of nouns in the document which are assigned to the \(i^{th}\) topic represented by the value \(\vec{v}_i.\) In our documents above, we might extract the set of topics \(\mathcal{T} = \lbrace \mbox{animals}, \mbox{activities} \rbrace\) and assign words as follows:</p>
>
><div data-simplebar>
>$$
>\begin{array}{|c|c|}
>\hline
>  \textbf{Word} & \textbf{Topic} \\ 
>\hline
>   \text{sports} & \text{activities} \\
>\hline
>   \text{dog} & \text{animals} \\
>\hline
>    \text{Baseball} & \text{activities} \\
>\hline
>    \text{hare} & \text{animals} \\
>\hline
>    \text{race} & \text{activities} \\
>\hline
>\end{array}
>$$
></div>
>
><p>So, the documents would be mapped to the following vectors:</p>
><div data-simplebar>
>$$
>\begin{array}{|c|c|}
>\hline
>  \textbf{Document} & \textbf{Vector} \\ 
>\hline
>   D_1 & \begin{bmatrix} 1.00 & 0.00 \end{bmatrix} \\
>\hline
>   D_2 & \begin{bmatrix} 0.75 & 0.25 \end{bmatrix} \\
>\hline
>    D_3 & \begin{bmatrix} 0.00 & 1.00 \end{bmatrix} \\
>\hline
>\end{array}
>$$
></div>

<p>Most topic models do not by themselves assign explicit semantic labels to the extracted latent topics, unlike in the above example. Generally, we need to assign them by hand or add additional structure that is capable of automatically generating meaningful labels.</p>

---

## Relevant Probability Distributions
<p>The precursor to the Embedded Topic Model is a method called Latent Dirichlet Allocation, first described by Blei et al.; LDA is arguably still the most widely used topic model to date. Before proceeding, we need to understand a probability distribution which is central to both LDA and the embedded topic model called the Dirichlet distribution. The best way to understand the Dirichlet distribution is by means of the Beta distribution first, as the former is a multidimensional generalization of the latter.</p>

<p>We'll first examine the distributions by themselves, then describe why they are important based on the assumptions made concerning the structure of the documents within the topic models.</p>

### The Beta Distribution

><p><b>Definition 1.2:</b> The <i>Beta distribution</i> is a probability distribution defined as: </p>
>$$f(x; \alpha; \beta) = \frac{1}{B(\alpha, \beta)} x^{\alpha - 1}(1-x)^{\beta - 1}$$
> <p>for \(x ∈ [0, 1]\) and \(\alpha , \beta > 0 \)</p>

<p>\(1/B(\alpha, \beta)\) is just a normalizing constant, so \(f(x; \alpha; \beta) \propto x^{\alpha - 1}(1-x)^{\beta - 1}.\)</p>

<p>Recall that the cumulative distribution function of any probability distribution must be 1 when evaluated at the upper limit of the sample space. This is because Kolmogorov's second axiom of probability states that since the sample space of a probability distribution represents the set of all possible outcomes of a random experiment, the probability of an experiment resulting in an outcome contained within the sample space is certain. Therefore, to retrieve the explicit normalizing constant, we can solve for \(c \) where:</p>

<div data-simplebar>$$1 = c \int_{0}^{1}  x^{\alpha - 1}(1-x)^{\beta - 1}dx \qquad \longrightarrow \qquad \frac{1}{\int_{0}^{1}  x^{\alpha - 1}(1-x)^{\beta - 1}dx} = c $$</div>

<p>Our first step is to notice that our integral is very similar in form to the Laplace transform of the convolution of \(x^{\alpha - 1} \) and \(x^{\beta - 1} :\)</p>

<div data-simplebar>$$\int_{0}^{1}  x^{\alpha - 1}(1-x)^{\beta - 1}dx \qquad \Bigg| \qquad \mathcal{L}(x^{\alpha-1} * x^{\beta-1}) = \int_{0}^{t}  \tau^{\alpha - 1}(1-\tau)^{\beta - 1}d \tau$$</div>

<p>Using known Laplace transform identities, we can rewrite this as </p>

<div data-simplebar>$$\mathcal{L}(x^{\alpha-1} * x^{\beta-1}) = \mathcal{L}(x^{\alpha-1}) \cdot \mathcal{L}(x^{\beta-1}) = \frac{\Gamma(\alpha)}{s^\alpha} \cdot \frac{\Gamma(\beta)}{s^\beta} = \frac{\Gamma(\alpha)\Gamma(\beta)}{s^{\alpha+\beta}}$$</div>

<p>where \( \Gamma(x) \) is the gamma function. Since \(\Gamma(\alpha)\Gamma(\beta)\) is a constant, we can inverse transform this as:</p>

<div data-simplebar>
$$\frac{\Gamma(\alpha)\Gamma(\beta)}{\Gamma(\alpha + \beta)} t^{\alpha+\beta-1}$$
</div>

<p>Since \(t=1,\) this gives us \(\Gamma(\alpha)\Gamma(\beta)/\Gamma(\alpha+\beta)\) or the <i>beta function</i>. Thus,</p>

<div data-simplebar>$$\frac{1}{\int_{0}^{1}  x^{\alpha - 1}(1-x)^{\beta - 1} \,dx} = \frac{\Gamma(\alpha+\beta)}{\Gamma(\alpha)\Gamma(\beta)} = c$$</div>

<p>With this, we can now rewrite the beta distribution as:</p>

<div data-simplebar>$$ f(x; \alpha; \beta) = \frac{\Gamma(\alpha+\beta)}{\Gamma(\alpha)\Gamma(\beta)} x^{\alpha - 1}(1-x)^{\beta - 1}$$</div>

<p>Tweaking the values of \(\alpha\) and \(\beta\) causes the beta distribution to take on different shapes. When both parameters are below 1 and equal, the graph resembles a U-shape, implying that the majority of the probability mass is present near the upper and lower limits of the sample space. When \(\alpha\) is larger than \(\beta\) or vice-versa, the majority of the mass is present near only one of the limits. When both limits are larger than 1, the mass is present towards the center of the sample space, resembling a bell curve.</p>

<center>
<img style="max-width:650px; width:100%;" src="../post_assets/topic_modeling/beta_graphs.png">
</center>
<p style="text-align: center; margin-top: 20px"><i><b>Figure 1.3:</b> A Beta Distribution with Various \(\alpha\) and \(\beta\) Parameters</i></p>

### The Dirichlet Distribution

<p> We will now introduce the multivariate generalization of the beta distribution.</p>

><p><b>Definition 1.4:</b> The <i>Dirichlet distribution</i> is a probability distribution defined as:</p>
><div data-simplebar>$$f(x_1,\cdots, x_k; \alpha_1, \cdots, \alpha_k) = \frac{1}{B(\alpha)} \prod_{i=1}^K x_i^{\alpha_k - 1}$$</div>
><p>where \(\alpha = [\alpha_1, \cdots, \alpha_k] ,\) \(\sum_{i=0}^K x_i = 1,\) and \(\alpha_k > 0\) for all \(k.\)</p>

<p>Notice that if \(K = 2\) and \(x_1 = 1 - x_2 ,\) this reduces to the beta distribution. To account for more variables, we extend the definition of the beta function as follows:</p>
<div data-simplebar>$$B(\alpha) = \frac{\prod_{i=1}^K\Gamma(\alpha_i)}{\Gamma(\sum_{i=1}^K\alpha_i)} $$</div>

<p>One of the many important aspects of the Dirichlet distribution is how it can be interpreted geometrically. The constraint \(\sum x_i = 1 \) tells us that the support of the distribution is a regular simplex with \(k \) vertices. Recall that a <i>regular simplex</i> is the set of all points \(p \in \mathbb{R}^k \) such that \(\sum_{i=1}^k p_i = 1 .\) To see this, consider the Dirichlet distribution with three variables.</p>

<center>
<img src="../post_assets/topic_modeling/Dirichlet.png">
</center>
<p style="text-align: center; margin-top: 20px"><i><b>Figure 1.5:</b> A Three-Variable Dirichlet Distribution with Various \(\alpha\) Parameters</i></p>

<p>As a result, one can view the process of sampling from a Dirichlet distribution as picking a point on this simplex, where each point has a different likelihood of being picked.</p>

<p>Since we are picking a point on the simplex, and each point \(p\) on the simplex has the property that \(\sum p_i = 1,\) then one can view our samples as priors to a categorical distribution in \(k\) variables. For this reason, the Dirichlet distribution can be viewed as a distribution of distributions.</p>

---

## Bayesian Inference
<p>Having discussed the Dirichlet distribution, we can now turn our attention to <i>Bayesian inference</i>, which will be critical in understanding Latent Dirichlet Allocation. We begin by recalling the definition of Bayes' theorem:</p>

><p><b>Theorem 2.3</b> Bayes' Theorem is stated as follows:</p>
>$$P(A \mid B) = \frac{P(B \mid A)P(A)}{P(B)}$$
><p>where \(A\) and \(B\) are events and \(P(B) \neq 0.\)</p>
><p><b>Proof:</b> This is an immediate result from the definition of conditional probability, which states \(P(B \mid A) = P(A \cap B)/P(A)\) if \(P(A) \neq 0.\) </p>
><p>We have \(P(B \mid A)P(A) = P(A \cap B),\) then \(P(A \cap B)/P(B) = P(A \mid B). \) <span style="float:right;">&#9724;</span></p>

<p>Bayes' theorem states that we can compute the probability of \(A\) occurring given \(B\) if we know the probabilities of \(A\) occurring, \(B\) occurring, and \(B\) occurring given \(A.\) If we subscribe to the Bayesian interpretation of probability (that probabilities represent one's degree of subjective uncertainty), this provides us with a framework to perform <i>belief updating</i>, or the manner in which to change our degree of uncertainty about an event as we receive new information.</p>

Consider the process of using Bayesian inference to determine if a coin is weighted towards heads. One way to determine this is to flip the coin a number of times and record the results. If the results tend towards heads, we have good reason to believe that the coin is likely weighted. Mathematically, this can be formed as a problem of <i>parameter estimation</i>, or trying to find a parameter for our chosen distribution which is assumed to best fit the observed data. A useful probability distribution function to model this is the <i>binomial distribution</i>, defined as:</p>
$$ f(k,n,p) = \binom{n}{k} p^k(1-p)^{n-k} $$
<p>With a frequentist approach, we would perform a number of trials \(X_1, \cdots, X_n ,\) create a likelihood function \(\mathcal{L}(p | X_1, \cdots, X_n)\) (which is the joint PDF of \(X_1, \cdots, X_n\) with \(p\) as a parameter), then attempt to maximize it using points where \(d\mathcal{L}/dp = 0.\)</p>
<p>Using a Bayesian approach, we would like to instead model our changing belief of the value of what \(p\) is likely to be as we get new batches of samples, through the use of Bayes' theorem. A core difference between estimating a parameter with an approach like maximum likelihood estimation and Bayesian inference is how the parameter in question is characterized. In the former, the parameter is an unknown constant, determined by means of an optimization procedure performed on the derivative of the likelihood function. </p>
<p>In the latter, we treat the parameter with uncertainty, applying a probability distribution to it. For concreteness, consider modeling our prior \(\theta \sim \mathcal{N}(\mu_0, \sigma_0^2) .\) By doing this, we are essentially stating that before any trials, we believe that \(\theta \) is most likely the value \(\mu_0,\) but could be something else. For example, it could be \(\mu_0 - \sigma_0 ,\) but we believe that's less likely to be the case, with the probability of each possible value of \(\theta \) modeled by our distribution \(\mathcal{N}(\mu_0, \sigma_0^2) .\)</p>
<p>Through Bayesian inference, we will be iteratively refining the parameters of our distribution based on the results of our trials so that at each new step \(i ,\) our new set of parameters \(\mu_i, \sigma_i^2 \) generate  a distribution more in line with the data we observe.</p>

<p>Before we continue, we must make a note regarding the <i>marginal likelihood</i> \(P(B) \) within Bayes' theorem. Recall that this is the probability an event will occur independent of some other event. For instance, if \(P(B|A) \) is the probability of thunder occurring given rain, then \(P(B) \) is the probability of thunder occurring regardless as to if it is raining or not.</p> <p>This acts as a normalizing constant, ensuring that the posterior distribution is in fact a legitimate probability distribution that adheres to Kolmogorov's axioms. However, this distribution can be difficult to compute in many circumstances, as marginalizing out a parameter typically requires us to sum or integrate over all possible parameter values, leading to an often intractable calculation. Moreover, in many cases we only care about certain relative aspects of the distribution, such as the location of the peak of the posterior (maximum a posteriori estimate). Since the application of a constant relative to \(\theta \) is a monotonic function, it does not change where this peak would be, therefore we are able to disregard it in those circumstances. </p> 

<p>This is not to say that the marginal probability is unimportant. If we need a true probability distribution from Bayes' theorem, we need to compute it. If it is challenging to calculate directly, there are fortunately many ways to estimate it, such as through <i>Monte Carlo Markov Chain methods</i> or <i>variational inference</i>, the latter of which we will be discussing later in this post.</p>

<p>A question naturally arises at this point: <i>given our statistical model for the data, which distribution for the prior probability do we choose? </i></p>

<p style="margin:0;">We can answer this question by describing the characteristics of what would make for a good prior distribution:</p>
<ul>
<li>The support of the prior distribution must match the range of the parameter in question. In the case of the binomial distribution, \(p \in [0,1] .\) Therefore, any distributions with supports outside of that range are not appropriate to use.</li>
<li>We would like the distribution to be as flexible as possible.</li>
<li>Ideally, the distribution should be mathematically convenient to work with. Specifically, we would like it to be a <i>conjugate prior</i> to our model of the data, which is a prior distribution that when used in conjunction with the likelihood function within Bayes' theorem produces a posterior within the same distribution family as the prior. The benefit of this is that we do not have to determine what distribution we have to evaluate each time and by extension change our methods, as we remain in the same family.</li>
</ul>

<p>For the binomial distribution, a prior distribution which exhibits these characteristics is the beta distribution. Most importantly, it has a support of \([0,1] .\) Furthermore, the distribution is flexible in its shape, ranging from bimodality to a unimodal bell curve. Finally, the beta distribution is a conjugate prior to the binomial distribution, as: </p>

<div data-simplebar>$$P(\theta | D) \propto P(D | \theta) P(D | \theta) = \binom{n}{k} \theta^k(1-\theta)^{n-k} \frac{\Gamma(\alpha+\beta)}{\Gamma(\alpha)\Gamma(\beta)} \theta^{\alpha - 1}(1-\theta)^{\beta - 1} = $$</div>
<div data-simplebar>$$\binom{n}{k} \frac{\Gamma(\alpha+\beta)}{\Gamma(\alpha)\Gamma(\beta)} \theta^{k+\alpha - 1}(1-\theta)^{n+\beta-k-1}$$</div>

### Bayesian Inference with the Dirichlet Distribution

<p>Consider the process of picking a categorical prior from the Dirichlet distribution:</p>
<div data-simplebar>$$\theta \sim Dir(\alpha), \qquad \theta = [\theta_1, \cdots, \theta_k], \qquad \sum_{i = 1}^k \theta_i = 1, \qquad p(\theta|\alpha) \propto \prod_{j=1}^k \theta_j^{\alpha_j - 1}$$</div>
<p>Now, consider grabbing some data from the categorical distribution parameterized by \(\theta.\) \( D = \lbrace x_1, \cdots x_n \rbrace \sim  Cat(\theta) \) where \( x_i \in \lbrace 1, \cdots, k\rbrace.\)</p>

<div data-simplebar>$$p(D|\theta) = \prod_{i=1}^n P(X_i = x_i|\theta) = \prod_{i=1}^n \theta_{x_i}$$</div>

<p>Since \(\theta_{x_i} = \prod_{j=1}^{k}  \theta_j^{\mathbb{I}(x_i = j)}\) we can rewrite this as:</p>

<div data-simplebar>
$$p(D|\theta) = \prod_{i=1}^n\prod_{j=1}^{k}  \theta_j^{\mathbb{I}(x_i = j)} = \prod_{j=1}^{k} \theta_j^{\sum \mathbb{I}(x_i = j)} = \prod_{j=1}^{k} \theta_j^{c_j}$$
</div>

<p>Since \(p(D|\theta)\) and \(p(\theta)\) come from the same family of distributions, we can say that \(p(\theta)\) is a conjugate prior to the posterior distribution \(p(\theta|D).\) By Bayes' Rule, we know that \(p(\theta|D) \propto p(D|\theta)p(\theta).\) Writing out the multiplication explicitly yields: </p>

$$\prod_{i=1}^{k} \theta_i^{c_i} \prod_{j=1}^k \theta_j^{\alpha_j - 1} \mathbb{I}(i=j) = \prod_{j=1}^k \theta_j^{c_i + \alpha_j - 1} $$

<p>This provides us with an update rule so that we may iteratively pick a categorical prior, observe data, and then update our Dirichlet prior. We now have a means to learn from data while maintaining the same kind of distribution.</p>

---

## Latent Dirichlet Allocation
<p>Having discussed the Dirichlet distribution and how we can perform Bayesian inference with it, we can now turn our attention to Latent Dirichlet Allocation as a primer for the Embedded Topic Model. To start, we make the following assumptions:</p>

<ul>
<li><p>Let \(D\) be a corpus of documents, \(K\) a list of topics, and \(W\) a dictionary of words. Let some document \(d_i \in D\) consist of \(n\) words and each word \(w_{i,j}\) be assigned to a topic \(k_{i,j} \in K.\) In addition, suppose we can only observe the words in each document, and don't have information about topic assignments.</p></li>

<li><p>If we randomly pick a word in the document, the probability that we pick the particular word \(w_p\) is dependent on the categorical distribution given by the total amount of times \(w_p\) is present in the document divided by the total amount of words in the document.</p></li>

<li><p>Likewise, the probability of the word we picked being assigned to a particular topic \(K_p\) is given by the amount of words in the document that that topic was assigned to divided by the total amount of words in the document; also a categorical distribution.</p></li>
</ul>

<p>In human languages, we intuitively know that particular words tend to be coupled to topics. For instance, if we're reading an article about pets, we're likely to find many instances of the words <i>cat</i> or <i>dog</i>, but not many instances of <i>algorithm</i>.</p>

<p>The goal of LDA is to be a statistical model which sets up a structure relating words to latent variables (topics) with the ability to learn relationships based on data while maintaining the categorical distributions described above. The reason why LDA employs the Dirichlet distribution is to be able to perform Bayesian inference with the categorical distribution as a prior and posterior. LDA is a hierarchical model; in particular, a mixture model. We will first provide the intuition for mixture models then provide a definition below.</p>

### Mixture Models

<center>
<img style="max-width:400px; width:100%;" src="../post_assets/topic_modeling/Cluster.png">
</center>
<p style="text-align: center; margin-top: 20px"><i><b>Figure 3.1:</b> Clusters That Could Be Represented by a Gaussian Mixture Model</i></p>

<p>Consider the problem of clustering a set of data. In this case, we're given a set of data, and are assuming that clusters exist within it. These clusters would be considered our latent variables. Following the clustering performed in the above image, it can be inferred that the data contained in each cluster adheres to a Gaussian distribution with respect to that particular cluster.</p>

<p>Mixture models aim to describe this entire dataset as a linear combination of the distributions of each individual cluster, rather than attempt to describe the entire dataset using a more complicated probability distribution with three peaks.</p>

<p>The key to understanding why this is possible is through marginalization. </p>

<p>Suppose that \(p(x)\) represents the probability of selecting a point, and \(p(x|c)\) be the probability of selecting a point given some cluster. By marginalization, we know that:</p>

$$p(x) = \sum_{c \in C} p(x|c)p(c) $$

<p>Thus, \(p(x)\) can be represented as a sum on a simpler joint distribution between observed and latent variables (in our case, clusters).</p>

<p>We will now give the non-Bayesian definition of a mixture model.</p>

><div data-simplebar>
><p><b>Definition 3.2:</b> A <i>mixture model</i> can be described as follows:</p>
><ul>
><li>\(K \) is the number of mixture components</li>
><li>\(N \) is the number of observations</li>
><li>\(\theta_{i=1, \cdots, K} \) is the parameter of distribution of observation of component \(i \)</li>
><li>\(\phi_{i=1, \cdots, K} \) is the mixture weight of component \(i \) (here, \(\sum_{i=1}^{K}\phi_i = 1 \))</li>
><li>\(z_{i=1, \cdots, N} \) is the component of observation \(i \)</li>
><li>\(x_{i=1, \cdots, N} \) is observation \(i \)</li>
><li>\(F(x|\theta)\) is the probability distribution of an observation </li>
><li>\(z_{i=1, \cdots, N} \sim \mbox{Cat}(\phi) \)</li>
><li>\(x_{i=1, \cdots, N} \sim F(\theta_{z_i})\)</li>
></ul>
></div>

In addition, we provide a definition for a Gaussian Mixture Model:

><div data-simplebar>
><p><b>Definition 3.3:</b> A <i>Gaussian mixture model</i> can be described as follows:</p>
><ul>
><li>\(K \) is the number of mixture components</li>
><li>\(N \) is the number of observations</li>
><li>\(\theta_{i=1, \cdots, K}  = \lbrace \mu_{i=1, \cdots, K}, \sigma^2_{i=1, \cdots, K} \rbrace\)</li>
><li>\(\phi_{i=1, \cdots, K} \) is the mixture weight of component \(i \) (here, \(\sum_{i=1}^{K}\phi_i = 1 \))</li>
><li>\(z_{i=1, \cdots, N} \) is the component of observation \(i \)</li>
><li>\(x_{i=1, \cdots, N} \) is observation \(i \)</li>
><li>\(z_{i=1, \cdots, N} \sim \mbox{Cat}(\phi) \)</li>
><li>\(x_{i=1, \cdots, N} \sim \mathcal{N}(\mu_{z_i},\sigma_{z_i} )\)</li>
></ul>
></div>

### Learning with Latent Dirichlet Allocation

Finally, we give the definition of Latent Dirichlet Allocation.

><p><b>Definition 3.4:</b> <i>Latent Dirichlet Allocation</i> may be described as follows:</p>
><ul>
><li>Choose two vectors \(\alpha \) and \(\beta ,\) where \(|\alpha| \) is the number of topics we have and \(|\beta| \) is the length of the vocabulary.</li>
><li>For each document \(d_i ,\) choose \(\theta_i \sim \mbox{Dir}(\alpha) \) and for each topic, \(\phi_k \sim \mbox{Cat}(\phi_{t_{i,j}}) .\)</li>
><li>Let \(d_i\) be a document with \(n\) words. For each word position \(w_{i,j}\) in a document, choose a topic \(t_{i,j} \sim Cat(\theta_i)\) and a word \(w_{i,j} \sim Cat(\phi_{t_{i,j}}).\)</li>
></ul>

<p>A natural assumption to make is that any particular document will only have a handful of topics contained in it, which would make our \(\alpha \) vector sparse. Using the Bayesian procedure described above for the Dirichlet distribution, we can fit this model to a dataset of documents.</p>

---

## Word Embeddings
<p>When attempting to make sense of natural language semantics, it’s useful to develop a representation of the vocabulary with relational properties. One way to do this is by means of a semantic network, an example of this being <a href="https://wordnet.princeton.edu/">WordNet</a>.</p>

><p><b>Definition 2.3:</b> A <i>semantic network</i> can be defined as a directed graph \(G = (V, E),\) where \(V\) represents a set of nodes or vertices, and \(E\) represents a set of directed edges. Each node in \(V\) corresponds to a concept or entity, and each directed edge in \(E\) represents a relationship or link between two nodes.</p>
><p>Formally, \(V = \lbrace v_1, v_2, ..., v_n \rbrace\) is the set of nodes, and \(E = \lbrace (v_i, v_j) | v_i, v_j \in V \rbrace \) is the set of directed edges. The directed edge \((v_i, v_j)\) signifies that there is a relationship from node \(v_i\) to node \(v_j.\) The edges can be labeled to indicate the type of relationship, such as <i>is-a</i>, <i>part-of</i>, <i>causes</i>, or any other relevant semantic connection.</p>

<p>Semantic networks excel at encoding hierarchical (is-a) relationships. For instance:</p>
$$\mbox{canary} \overset{is-a}{\longrightarrow} \mbox{bird}$$
$$\mbox{Jane} \overset{is-a}{\longrightarrow} \mbox{human}$$
$$\mbox{Human} \overset{is-a}{\longrightarrow} \mbox{mammal}$$
<p>Due to its graph structure, transitive logic is easy. We can simply chain together facts to determine that <i>Jane is a human and human is a mammal, thus Jane is a mammal.</i></p>

<p>In addition, it’s easy to extend the network to include and reason with particular instances of words, as well as possessive (has) and descriptive (is) relationships:</p>
$$\mbox{Jane} \overset{has}{\longrightarrow} \mbox{eyes} \overset{is}{\longrightarrow} \mbox{brown}$$
$$\mbox{Mary} \overset{has}{\longrightarrow} \mbox{eyes} \overset{is}{\longrightarrow} \mbox{brown}$$
$$\mbox{John} \overset{has}{\longrightarrow} \mbox{eyes} \overset{is}{\longrightarrow} \mbox{green}$$

<pre class="source-code">
<code class="source-code-wrapper" style="background: #404040!important;">
<div data-simplebar>
<div class="source-code-content prolog">
human(jane).
human(mary).
human(john).
eye_color(jane, brown).
eye_color(mary, brown).
eye_color(john, green).
?- human(X), eye_color(X, brown), human(Y), eye_color(Y, brown), X \= Y.
X = jane, Y = mary;
</div>
</div>
</code>
</pre>

<p style="text-align: center; margin-top: -5px"><i>Prolog code which describes such a semantic network.</i></p>

<p>Assuming that <i>Jane</i>, <i>Mary</i>, and <i>John</i> are connected to <i>human</i> by a <i>is-a</i> relationship, we could say that the abstract node human can have green or brown eyes, and quantify that there exists at least two humans with brown eyes, and at least one with green eyes. This kind of relationship is very natural to us, as we tend to think of a word as a symbolic link to something else. However, semantic networks are not without their downsides:</p>
<ul>
<li>It can be hard to generate a network; in the past, these had to be hand-built. However, strides are being made towards doing this automatically with ontology learning.</li>
<li>It is not easy to capture analogous reasoning within a semantic network. One might wonder how you can use a network to answer: <i>Man is to woman as king is to what?</i></li>
<li>Semantic networks usually do not by themselves capture degrees of synonymy or intensity of words. <i>Good</i> and <i>incredible</i> could be synonymous in a network, but they don’t have the same semantic meaning. It feels like <i>good</i> and <i>alright</i> should have a closer similarity measure than <i>good</i> and <i>incredible</i>.</li>
</ul>

<p>To deal with the latter two issues, one solution is to come up with a real-valued measurement between words. One option is to learn representations these words in a continuous metric space. Considering words to be vectors in a vector space is a natural choice for the following reasons:</p>
<ul>
<li>Vectors are easy to encode in numerical form, and most hardware has been optimized for linear algebra, allowing for fast computation.</li>
<li>Vector addition/subtraction provides an easy mechanism for how we might perform analogical reasoning: \(v_{woman} + v_{king} - v_{man} \approx v_{queen}.\)</li>
<li>There exists a variety of measures for similarity, such as cosine similarity given by \((A \cdot B)/(||A||\cdot||B||) \in [-1,1].\) </li>
<li>The amount of dimensions we choose for our vector space to have is a hyperparameter we can optimize for, giving us more flexibility. </li>
</ul>

><p><b>Definition 2.4:</b> Such a model that represents the semantic content of words as vectors in a vector space is called a <i>word embedding model</i>.</p>

<p>Following a training procedure which generates vectors for words based off of a text corpus, each axis can be said to represent a latent meaning associated with it, similar to how certain hidden units in a neural network can represent latent features. The larger the dimension of the vector space, the more space there is for features.</p>

### Generating Word Embeddings
<p>There are a variety of ways we can use to generate word embeddings. Common methods include:</p>
<ul>
<li>Naive Softmax</li>
<li>Hierarchical Softmax</li>
<li>Negative Sampling</li>
<li>Co-occurrence Matrix Methods</li>
<ul>
<li>Singular Value Decomposition</li>
<li>Global Vectors</li>
</ul>
</ul>

<p>We'll focus on singular value decomposition in the following paragraphs, since it is easy to understand. We begin by constructing an object called <i>co-occurrence matrix</i>, which is a count of how often words appear in the same <i>reference frame</i>. If we consider the reference frame to be two words, then we’ll say that one word appears in the presence of another if it’s at most a distance of two words from it in a text corpora. Reference frames are something we select, and can be considered to be another hyperparameter to optimize. These can be a specific word distance, an entire sentence, etc. The idea behind a co-occurrence matrix is that words that are used in close proximity to one another are likely to have meanings that are also in close proximity.</p>

<p>Consider the following text: <i>My car is having engine problems. Typically, the engine of a car lasts for about a quarter of a million miles.</i> </p>

<p>For brevity, we're only going to consider the nouns in this sentence, and we will use a window length of 4. The following is a co-occurrence matrix:</p>

<div data-simplebar>
$$\begin{array}{ccccccc}
& \text{million} & \text{problems} & \text{engine} & \text{car} & \text{quarter} & \text{miles} \\\
\text{million} & 0 & 0 & 1 & 1 & 1 & 1 \\\
\text{problems} & 0 & 0 & 1 & 1 & 0 & 0 \\\
\text{engine} & 1 & 1 & 0 & 2 & 1 & 1 \\\
\text{car} & 1 & 1 & 2 & 0 & 1 & 1 \\\
\text{quarter} & 1 & 0 & 1 & 1 & 0 & 1 \\\
\text{miles} & 1 & 0 & 1 & 1 & 1 & 0 \\\
\end{array}$$ 
</div>

<p>By the existence theorem of singular value decomposition, we know that any square symmetric matrix \(M \) has a decomposition \(M = U \Sigma V^T ,\) where \(U \) and \(V \) are unitary matrices, and \(\Sigma \) is a rectangular diagonal matrix with positive entries. The result of SVD for the above matrix is as follows:</p>

<div data-simplebar>
$$U = \begin{bmatrix}
-0.381 & -0.348 & 0.260 & 0.000 & -0.783 & -0.230 \\\
-0.218 & 0.726 & 0.653 & 0.000 & 0.000 & 0.000 \\\
-0.509 & 0.235 & -0.431 & -0.707 & 0.000 & 0.000 \\\
-0.509 & 0.235 & -0.431 & 0.707 & 0.000 & 0.000 \\\
-0.381 & -0.348 & 0.260 & 0.000 & 0.591 & -0.563 \\\
-0.381 & -0.348 & 0.260 & 0.000 & 0.192 & 0.794 
\end{bmatrix} $$

$$ \Sigma = \begin{bmatrix}
4.673 & 0.000 & 0.000 & 0.000 & 0.000 & 0.000 \\\
0.000 & 0.648 & 0.000 & 0.000 & 0.000 & 0.000 \\\
0.000 & 0.000 & 1.321 & 0.000 & 0.000 & 0.000 \\\
0.000 & 0.000 & 0.000 & 2.000 & 0.000 & 0.000 \\\
0.000 & 0.000 & 0.000 & 0.000 & 1.000 & 0.000 \\\
0.000 & 0.000 & 0.000 & 0.000 & 0.000 & 1.000 
\end{bmatrix}$$

$$V^T = \begin{bmatrix}
-0.381 & -0.218 & -0.509 & -0.509 & -0.381 & -0.381 \\\
-0.348 & 0.726 & 0.235 & 0.235 & -0.348 & -0.348 \\\
-0.260 & -0.653 & 0.431 & 0.431 & -0.260 & -0.260 \\\
0.000 & 0.000 & 0.707 & -0.707 & 0.000 & 0.000 \\\
0.783 & 0.000 & 0.000 & 0.000 & -0.591 & -0.192 \\\
0.230 & 0.000 & 0.000 & 0.000 & 0.563 & -0.794 
\end{bmatrix} $$
 </div>
 
<p>To get our corresponding word vectors, we may take the \(i^{th} \) column vector of \(V^T \) or the \(i^{th} \) row vector of \(U \) for the corresponding word in the \(i^{th} \) column of the co-occurrence matrix. We can then do a quick check to see if these are sensible vectors by attempting to compute similarity via the dot product (or cosine similarity). We will choose the former, and take the column vectors of \(V^T .\) As a side note, the matrices \(U \) and \(V^T \) are called <i>vocabulary embeddings</i>, since they contain the vectors of every word in our vocabulary.</p>

<p>Now, let's attempt to compute some similarity metrics. It should be the case that <i>engine</i> and <i>car</i> are more similar than <i>problems</i> and <i>million</i>. For the former, our similarity value is \(0.000218 \) whereas for the latter, the value is \(0.00019 .\) The difference is quite small due to limited data, but it is there.</p>

---

## The Embedded Topic Model
<p>Having discussed word embeddings, we now have enough background to begin covering content specific to the embedded topic model. We will begin by looking at the particular word embedding used in the ETM.</p>

### Continuous Bag of Words
<p>Continuous Bag of Words (CBOW) is an embedding method which is based on the problem of predicting a word in a document given its surrounding words. That is to say, if we are given the sentence <i>The quick brown fox ______ over the lazy dog.</i>, our task is to determine what word to use to fill in the blank. To solve this problem, we can learn embeddings such that words that are near each other have similar vector representations, then use these vectors to help us predict the missing word. </p>

<p>Recall our notion of a vocabulary embedding from the last section, which is our set of learned vector representations of words concatenated into a matrix: </p>

$$\rho = \begin{bmatrix} \rho_{1,1} & \rho_{1,2} & \cdots & \rho_{1,m} \\\
\rho_{2,1} & \rho_{2,2} & \cdots & \rho_{2,m} \\\
\vdots & \vdots & \ddots & \vdots \\\
\rho_{n, 1} & \rho_{n,2} & \cdots & \rho_{n,m} \end{bmatrix}$$

<p>Here, we have \(m\) words, each of which are represented by \(n \times 1\) vectors.</p>

<p>For an instance of CBOW, let our context window be \(\alpha_1, \cdots, \alpha_{k-1}, \alpha_k, \alpha_{k+1}, \cdots, \alpha_n .\) \(W = \lbrace \alpha_1, \cdots, \alpha_{k-1}, \alpha_{k+1}, \cdots, \alpha_n \rbrace \) will be the set of words we take into consideration when trying to determine \(\alpha_k .\) Our approach to this will be to first average the word vectors associated with every element in \(W ,\) then perform matrix multiplication with our vocabulary embedding. Finally, we apply a <i>softmax</i> function to the resulting vector to get a corresponding vector with a norm of \(1.\) This gives us a parameter for a categorical distribution, which we can then sample from to generate a prediction for the missing word.</p>

<p>Since our learning procedure should have generated vectors which are similar if they are nearby in a corpus, we would expect that the missing word should have a similar embedding assuming the context window follows the distribution of the corpus we trained on. Thus, we should expect that the resulting index of the vector generated from multiplying the average context word embedding with the vocabulary embedding should have a high value relative to other values in the vector. When fed into a softmax function then taken as a categorical distribution, this translates to a high probability a word that is commonly seen amongst the averaged words will be chosen.</p>

<p>Mathematically speaking:</p>

$$v_k = \frac{1}{n-1} \sum_{\alpha_i \in W} \alpha_i $$

$$\mbox{softmax}(\vec{k})_i = \frac{e^{k_i}}{\sum _{j=1}^n e^{k_j}}$$

$$\alpha_k \sim \mbox{Cat}(\mbox{softmax}(\rho^Tv_k))$$

### The Logistic Normal Distribution
In this new model, we depart slightly from our standard Dirichlet distribution and introduce something called the <i>logistic normal distribution</i>, which is the <i>multivariate normal distribution</i> with a softmax function applied to its samples. By itself, the multivariate normal distribution is a generalization of our familiar bell curve to multiple variables, and satisfies all of the typical axioms of a probability distribution as we would expect.

<div data-simplebar>

><p><b>Definition 6.1:</b> The PDF of the <i>multivariate normal distribution</i> is defined as:</p>
> $$f_X(x_1,\cdots,x_n) = \frac{\exp(-\frac{1}{2} (\vec{x} - \vec{\mu})^T \Sigma^{-1}(\vec{x} - \vec{\mu})}{\sqrt{(2\pi)^n \det(\Sigma)}}$$
><p>where \(\vec{\mu} \in \mathbb{R}^n\) and \(\Sigma \in \mathbb{R}^{n \times n}\) (\(\Sigma\) is also positive-semidefinite).</p>

</div>

<p>Each element \(\vec{x}_i\) in the vector that is sampled from the distribution can be thought of as a random variable from its own (single-variable) normal distribution, each of which being related to one another the covariance matrix \(\Sigma.\) Understanding \(\vec{\mu}\) is straightforward as \(\vec{\mu}_i\) corresponds to the mean of \(\vec{x}_i,\) but what of the covariance matrix?</p>

<p>\(\Sigma\) has the property that: </p>

<div data-simplebar>
$$\Sigma_{X_i,X_j} = cov(X_i, X_j) = E[(X_i - E[X_i])(X_j - E[X_j])]$$
</div>

<p>Since \(cov(X_i, X_i) = var(X_i),\) the diagonal elements of the matrix are the variance of each variable. Naturally, the matrix is symmetric.</p>

<p>As stated before, a draw from this distribution is a sample from the multivariate normal distribution normalized to a unit vector via the softmax function. So: </p>

<div data-simplebar>
$$X \sim \mathcal{LMN}(\mu, \Sigma) = \mbox{softmax}(Y) \mbox{ where } Y \sim \mathcal{MN}(\mu, \Sigma)$$
</div>

### Definition of the Embedded Topic Model
We may now define the embedded topic model:
><p>Let the \( L \times V \) vocabulary embedding be \( \rho ,\) where the column \(\rho_v\) is the embedding of \(v.\) Under the <i>Embedded Topic Model</i>, we generate the \(d^{th}\) document as follows: </p>
><ol>
> <li>Draw Topic Proportions: \( \theta_d \sim \mathcal{LMN}(0,I),\) where \(\theta_d = \mbox{softmax}(\delta_d)\) and \(\delta_d \sim \mathcal{MN}(0,I) \)</li>
> <li>For each word position \(n\) in the document \(d:\)</li>
><ul>
><li>Draw topic assignment \(z_{dn} \sim \mbox{Cat}(\theta_d) \)</li>
><li>Draw the word \(w_{dn} \sim \mbox{softmax}(\rho^T \alpha_{z_{dn}})\) where \(\alpha_k \) is the \(k^{th} \) topic embedding.</li>
></ul>
></ol>

<p>Parts 1 and 2a are similar to LDA, with the exception of the distribution we draw from (with parameters being the zero vector and the identity matrix) for the topic proportions. Step 2b is different since it generates a categorical prior based on the correspondence between words in our word embedding matrix and the embedding of the chosen topic, resembling the continuous bag of words model described earlier.</p>

<p>Thus, the two primary differences between ETM and LDA are:</p>
<ul>
<li>Rather than each topic being a distribution over words, it is just a learned vector. Our metric for determining how much a word belongs to a topic is just an inner product.</li>
<li>The a priori assumption that LDA took on where a document is heavily represented by a few topics is not present in the ETM.</li>
</ul>

### Bayesian Inference with the ETM
<p>We now have to consider how we might learn the parameters of the ETM (the topic and vocabulary embeddings) from a set of documents \(A = \lbrace w_1, \cdots, w_D \rbrace.\) We begin by considering the marginal log-likelihood:</p>

<div data-simplebar>
$$\mathcal{L}(\alpha, \rho) = \sum_{d=1}^D \log p(w_d \mid \alpha, \rho)$$
</div>

<p>This represents the probability of picking the words in our document given the vocabulary embedding and topic embedding matrices with the topic proportions marginalized out. This comes from the likelihood \(p(W \mid \alpha, \rho)\) where \(W\) is the set of words in our documents. Since each document is independent from the other:</p>

<div data-simplebar>
$$p(W \mid \alpha, \rho) = \prod_{d=1}^D p(w_d \mid \alpha, \rho) \propto \sum_{d=1}^D \log p(w_d \mid \alpha, \rho)$$
</div>

<p>where \(w_{d,n}\) is the \(n^{th}\) word position in the \(d^{th}\) document. If we want to compute this, we have to include the previously marginalized topic sampled from a logistic normal distribution: </p>

<div data-simplebar>
$$p(w_d \mid \alpha, \rho) = \int p(\delta_d) \prod_{n=1}^{N_d}  p(w_{d,n} \mid \alpha, \delta_d ,\rho) d \delta_d$$
</div>

<p>Since the words are independent, we can split this into a product of probabilities. Furthermore, we can write:</p>

<div data-simplebar>
$$p(w_{d,n} \mid \alpha, \delta_d, \rho) = \sum_{k=1}^K \theta_{d,k} \beta_{k,w_{d,n}}$$
</div>

<p>where \(\beta_{k,w_{d,n}} = \mbox{softmax}(\rho^T \alpha_k)|_{ w_{d,n}}\)</p>

<p>This is because we know that the \(w_{d,n} \sim \mbox{softmax}(\rho^T \alpha_{z_{d,n}}).\) Since \(\theta_{d,k}\) acts as a weight and \(\sum_{k=1}^K \theta_{d,k} = 1,\) we're simply computing the probability of a word being chosen based on a weighted inner product. So, our explicit likelihood function is:</p>

<div data-simplebar>
$$\sum_{d=1}^D \log \Bigg( \int p(\delta_d) \prod_{n=1}^{N_d} \Bigg(\sum_{k=1}^K  \theta_{d,k}  \beta_{k,w_{d,n}} \Bigg) d\delta_d \Bigg)$$
</div>

### Approximating using Variational Inference
<p>This integral is intractable due to the fact that as you add documents, the space of possible variable assignments increases exponentially. To remedy this, we leverage <i>variational inference</i>. This attempts to approximate intractable problems of Bayesian inference by casting them as optimization problems.</p>
<p>The basic idea is this: <i>Suppose we are given a probability distribution \(p\) which proves intractable to estimate. We can take a class of probability distributions \(Q,\) and generate a distribution from that class \(q \in Q\) which is most similar to \(p\) out of all other \(q'\in Q.\)</i></p>
<p>Variational approaches usually don't find the globally optimal solution, rather a local maxima. We frame it as an optimization problem of two parameters; the model parameters of \(q\) as well as the variational parameters \(v\) which describe the similarity between \(q\) and \(p.\)</p>
<p>To set up a variational inference scheme for our problem, first consider a class of distributions for our untransformed topic proportions: \(q(\delta_d; w_d, v)\) as a Gaussian distribution whose mean and variance are sampled from something called an <i>inference network</i>, which is a neural network parameterized by \(v.\) This network takes in the words of a document as a vector input and outputs the mean and variance.</p>
<p>Note that since our neural network has a fixed input length, we have to represent each document as a vector of the same length, regardless of the size. As a result, we cluster our words into a bag-of-words representation. We are going to be optimizing a function called ELBO, or <i>Evidence Lower Bound</i>. The <i>evidence</i> is synonymous with the value of our likelihood function at a particular set of parameters.</p>

<p>The ELBO function is related to the evidence in that it gives a lower bound on the likelihood function when evaluated at specific parameters. That is to say, the value we get when evaluating ELBO at particular parameters provides a guarantee that the likelihood function is not below a certain value when evaluated at those same parameters.</p>

<p>Since we can't maximize the evidence directly, we can instead work on maximizing the ELBO, which indirectly provides us evidence that our choice of parameters are good. The difference between the ELBO and our likelihood function can be proven to just be the <i>Kullback-Leibler Divergence</i> between the two distributions \(q\) and \(p.\) For continuous distributions, this is defined to be:</p>

<div data-simplebar>
$$D_{KL}(p ||  q) = \int_{-\infty}^\infty p(x)\log\frac{p(x)}{q(x)}dx $$
</div>

<div data-simplebar>
<p>so \(D_{KL}(p ||  q) = evidence - ELBO \implies ELBO = evidence - D_{KL}(p ||  q).\)</p>
</div>

<div data-simplebar>
$$\mathcal{L}(\alpha, \rho, v) = \sum_{d=1}^D \sum_{n=1}^{N_d} \mathbb{E}_ q[\log p (w_{dn} \mid \delta_d, \rho, \alpha)] - \sum_{d=1}^D KL(q(\delta_d; w_d, v) || p(\delta_d)) $$
</div>

<p>We then optimize \(\mathcal{L}(\alpha, \rho, v)\) with respect to the variational and model parameters. This can be done through a variety of methods; in the paper, the authors use the stochastic optimization with Monte Carlo approximations. We will not go into the details of this, and instead end the post here.</p>

---

## References

<p>[1] Blei, David M., Andrew Y. Ng, and Michael I. Jordan. "Latent dirichlet allocation." Journal of machine Learning research 3.Jan (2003): 993-1022.</p>
<p>[2] Dieng, Adji B., Francisco JR Ruiz, and David M. Blei. "Topic modeling in embedding spaces." Transactions of the Association for Computational Linguistics 8 (2020): 439-453.</p>
<p>[3] Bishop, Christopher M., and Nasser M. Nasrabadi. Pattern recognition and machine learning. Vol. 4. No. 4. New York: springer, 2006.</p>
<p>[4] Manning, Christopher, and Hinrich Schutze. Foundations of statistical natural language processing. MIT press, 1999.</p>
<p>[5] Princeton University "About WordNet." WordNet. Princeton University. 2010. </p>

---