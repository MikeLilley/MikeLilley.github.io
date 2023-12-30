---
author: "Michael Lilley"
title: "Simplicial Homology"
date: "2023-06-07"
description: "We discuss the problem of hole-counting within topological spaces. Following an example motivated by graphs, we find that certain topological spaces can be triangulated to objects called simplicial complexes. We then develop a framework to compute holes by counting the independent cycles in a simplicial complex. Finally, we formalize this framework into the concept of homology groups."
summary: "We discuss the problem of hole-counting within topological spaces via triangulation with simplicial complexes."
tags: ["algebraic-topology", "homology", "simplicial-complex"]
cover:
    image: simplicial_homology_cover.png # image path/url
    hidden: true
---

---

## Introduction

<p>In topology, we study objects contained in topological spaces with respect to something called a homeomorphism. </p>

><p><b>Definition 1.1:</b> Let \(X\) and \(Y\) be topological spaces. \(X\) and \(Y\) are said to be homeomorphic (or topologically equivalent) if there exists a continuous bijective function \(f: X \rightarrow Y\) that maps all points in \(X\) to points in \(Y,\) such that the inverse of the function is also continuous. The map \(f\) is called the <i>homeomorphism</i>. </p>

<p>Visually speaking, a homeomorphism can be thought of as a continuous mapping that stretches and bends a topological space into another, without any sort of tearing or gluing. The existence of homeomorphisms are an important topic of study because they preserve all properties of a topology, and can show that two seemingly-different spaces are actually equivalent. Homeomorphisms between topological spaces are akin to isomorphisms between algebraic structures.</p>

<p> Holes are one example of an invariant topological property under homeomorphism. This means that we have to ensure that both of our topological spaces have the same amount of holes before attempting to construct a homeomorphism from one to the other. For this reason, we often group topological spaces together by their hole count, or <i>genus</i>.</p>

It is not easy to classify the genus of most topological objects, since what constitutes a hole is subject to discretion at first glance. This is especially pronounced in high-dimensional spaces. It wasn't until the late 1800s that a convenient theory for hole-counting was developed, when Poincaré published his seminal essay, <i>Analysis Situs</i>. In this, he laid out the foundations for homotopy and homology, two distinct but closely-related theories for recognizing and counting holes within topological objects. We will focus on the latter, but we will introduce the definition of a homotopy in the next section.</p>

---

## Preliminary Definitions

Before we go any further, we must state some definitions.

><p><b>Definition 2.1:</b> A <i>connected space</i> is a topological space that cannot be represented as the union of two or more disjoint non-empty open subsets.</p>

><p><b>Definition 2.2:</b> A <i>path</i> in a topological space \(X\) is a continuous function \(f\) from the unit interval \(I = [0,1]\) to \(X\); \(f: I \rightarrow X.\) \(f(0)\) and \(f(1)\) are the start and terminal points of the path, respectively.</p>

><p><b>Definition 2.3:</b> A topological space \(X\) is said to be a <i>path-connected space</i> if there exists a path \(f\) joining any two arbitrary points in \(X.\)</p>

><p><b>Definition 2.4:</b> A <i>homotopy</i> between two paths \(f\) and \(g\) is a continuous function \(H: X \times [0, 1] \rightarrow Y\) such that \(H(x, 0) = f(x)\) and \(H(x, 1) = g(x).\) </p>

><p><b>Definition 2.5:</b> A <i>simply connected space</i> is a topological space \(X\) where a homotopy exists for any arbitrary two paths with \(a, b \in X\) as endpoints.</p>

<center><img src="../post_assets/simplicial_homology/Homotopy_curves.png"></img></center>
<p style="text-align: center; margin-top: -10px"><i><b>Figure 2.6:</b> Examples of Paths and Homotopies; Adapted From <a href="https://commons.wikimedia.org/wiki/File:Homotopy_curves.svg">Archibald</a></i></p>

<p>If \(X\) is not a simply-connected space, then we say that holes exist in \(X.\) These are the spaces we are interested in studying. This idea of stretching paths over a topological space gives us a means to know if holes exist within a topological space, but as stated in the prior section, our goal is to count how many holes there are. As it turns out, this is a much harder problem. Individual holes are hard to identify directly since they exist outside of our topological space. However, one thing we can do is attempt to quantify and capture the topological structure that exists around our holes, and count those structures instead.</p>

><p><b>Definition 2.7:</b> A <i>loop</i> in a topological space \(X\) is a path \(f\) such that \(f(0) = f(1).\) In other words, a loop is a path whose starting point is equal to its ending point.</p>

<p>Consider a sheet of paper. We typically characterize a hole in the paper as being distinct from a tear if the hole is surrounded by a closed loop of the object's material. The essence of this physical analogy is what homology exploits in order to identify holes. To count holes, we should count the amount of loops in a topological space.</p>

---

## Motivating Homology with Graphs

<p>Now that we have the fundamental definitions out of the way, it proves useful to work in a specific topological space in order to develop the rest of our intuition as well as some mathematical tools we will be working with. We will work in the graph topology, since it is easy to understand and illustrate.</p>

><p><b>Definition 3.1:</b> The <i>graph topology</i> \(T\) is the topological space which arises from a normal graph \(G = (V,E)\) by replacing each vertex \(v \in V\) by a point in \(\mathbb{R}\) and each edge \(e \in E\) by a copy of the unit interval \(I = [0,1].\) </p>

<center><img style="max-width:350px; width:100%;" src="../post_assets/simplicial_homology/diagram-20230704.png"></img></center>
<p style="text-align: center;"><i><b>Figure 3.2:</b> A Three-Node Graph </i></p>

<p>Let \(G\) be the directed graph illustrated in Figure 3.2 with the graph topology. We will denote the set \(V^* \subseteq T\) as the labeled copies of the unit intervals which correspond to each edge in \(G,\) as well as the set \(E^* \subseteq T\) as the points in \(T\) which correspond to the vertices of \(G.\)</p>

<p>Naturally, a path in \(T\) can be thought of as a walk on the graph from one vertex to another via their adjacent edge. Since we can walk all around \(G,\) it is meaningful to define path composition in \(T.\)</p>

><p><b>Defintion 3.3:</b> Let \(P_1, P_2 \in E^*,\) where \(P_1(1) = P_2(0)\) or \(P_1(0) = P_2(1).\) <i>Path composition</i> is a binary operation \(\circ\) on \(P_1\) and \(P_2\) which results in a mapping of the unit interval \(I\) onto \(P_1 \cup P_2.\)</p>

<p>In this manner, we treat \(P_1\) and \(P_2\) as one conjoined path within our graph topology. If \(P_1(x) = P_2(y),\) the edge will have endpoint vertices \(P_1(y)\) and \(P_2(x),\) where \(x, y \in \lbrace 0, 1 \rbrace.\) An exception to the above condition is path composition with the identity path \(0 \in E^*,\) where \(P_1 \circ 0 = P_1.\) It is useful to carry the structure of directedness on edges over to our topological space when speaking of path composition, as we can then generate paths in \(E^*\) that are the opposite direction of an edge in \(E.\) As an example with additive notation, consider \(C \in T.\) \(C(0) = z,\) while \(C(1) = x.\) If we invert the path, \(-C(0) = x,\) whereas \(-C(1) = z.\)</p>

<p>As an example, \(A \circ B\) and \(-A \circ C \circ -B \) would be examples of valid paths; \(A \circ -B \) and \(B \circ D \circ C \) would be undefined paths using path composition per our constraint that \(P_1(1) = P_2(0)\) or \(P_1(0) = P_2(1).\) </p>

<p>Notice that \(\circ\) is a commutative operation. \(A \circ B\) and \(B \circ A\) both yield a path that connects \(A\) and \(B\) with endpoints \(A(0)\) and \(B(1).\) In fact, \(F_1 = (E^*, \circ)\) actually forms a free abelian group, a fact that we will end up exploiting later on. We will assume this without proof.</p>

><p><b>Defintion 3.4:</b> A <i>free abelian group</i> is defined as an abelian group that contains a set of basis elements.</p>

<p>In addition to \((E^*, \circ),\) let us construct the free abelian group \(F_0 = (V^*, +),\) which we will define as the set of linear combinations of elements \(v \in V^*.\)</p>

<p>Now we are ready to introduce the fundamentals of loops in a homological sense. Recall that a boundary \(\partial (S)\) of a subset \(S\) in a topological space \(X\) is the set of all points \(x \in Cl(S) - Int(S).\)</p>

<p>On our graph topology, we will define the boundary operator \(\partial : F_1 \rightarrow F_0\) as a homomorphism which maps a path \(P \in E^*\) to a linear combination of its endpoints of the form \(P(1) - P(0),\) its terminal and starting points.</p>

><p><b>Definition 3.5:</b> On our graph topology, we will define the boundary operator \(\partial : F_1 \rightarrow F_0\) as a homomorphism which maps a path \(P \in E^*\) to a linear combination of its endpoints of the form \(P(1) - P(0),\) its terminal and starting points.</p>

<p>For example, consider the labeled edge \(A \in E^*:\) \(\partial (A) = y - x.\)</p>

<p>Defining \(F_0\) as a group of linear combinations of vertices was not an unbiased decision, as it provides a means to show that our boundary operator is distributive over path composition. Most importantly, it allows us to do arithmetic with our vertices.</p>

<p>Consider \(\partial (A \circ B) = (y - x) + (z - y) = (z - x).\) Using our boundary operator, we may define a loop as any path \(P \in E^*\) such that \(\partial (P) = 0.\) Loops in the graph topology are also known as <i>cycles</i>, and we may define a subgroup \(C \leq E^*\) of all cycles in \(E^*\) known as the <i>cycle space</i>.</p>

<p>Consider the following three cycles in \(C,\) which we can confirm are indeed cycles by applying our boundary operator:</p>

<div data-simplebar>
\[
\begin{array}{|c|c|}
\hline
  \textbf{Composition} & \textbf{Application of Boundary Operator} \\ 
\hline
   (C \circ -D) & \partial (C \circ -D) = (x - z) - (x - z) = 0 \\
\hline
   (A \circ B \circ C) & \partial (A \circ B \circ C) = (y - x) + (z - y) + (x - z) = 0 \\
\hline
    (A \circ B \circ D) & \partial (A \circ B \circ D) = (y - x) + (z - y) + (x - z) = 0 \\
\hline
\end{array}
\]
</div>

<p>So, by simply saying that the total amount of holes in \(T\) corresponds to the cardinality of \(C,\) we end up with an infinite amount of holes. Obviously, this proves to be not very useful. However, one thing to do is to apply the simple restriction of linear independence to our cycle space to give us a finite hole count. Let \(H: G \rightarrow \mathbb{Z}\) be the hole-counting function for some arbitrary graph \(G.\) We define \(H(G)\) to be equivalent to the amount of linearly independent cyclic paths in \(C.\) Before we move forward, note that linear independence is not presently well-defined on our path space \(C.\)</p>

<p>Since \(C\) is a subgroup of \(E^*,\) \(C\) is also a free abelian group. Since we are looking for a count of linearly independent elements, this corresponds to the total amount of basis elements in \(C.\) To find the corresponding basis elements in \(C,\) consider an arbitrary path \((\alpha A \circ \beta B \circ \gamma C \circ \delta D).\) Note that the coefficients associated with our edges simply serve as shorthand multiplicative notation to the path composition operator.</p>

<div style: "margin-top:-10px" data-simplebar>
<p>$$\partial (\alpha A \circ \beta B \circ \gamma C \circ \delta D) = \\ \alpha \partial (A) + \beta \partial (B) + \gamma \partial (C) + \delta \partial (D) =$$
<p>$$\alpha (y - x) + \beta (z - y) + \gamma (x - z) + \delta (x - z)$$
</div>

<p>Grouping these together in terms of our vertices, this can be written as:</p>

<div data-simplebar>
<p>$$\partial(\alpha A \circ \beta B \circ \gamma C \circ \delta D) = x(- \alpha + \gamma + \delta) + y(\alpha - \beta) + z(\beta - \gamma - \delta)$$</p>
</div>

<p>So, in order for our path \(\alpha A \circ \beta B \circ \gamma C \circ \delta D\) to be a cycle, the following three conditions must be satisfied:</p>

<center>
$$(- \alpha + \gamma + \delta) = 0$$
$$(\alpha - \beta) = 0$$
$$(\beta - \gamma - \delta) = 0$$
</center>

<p>The above conditions form a system of linear equations, so describing the basis elements of \(C\) is equivalent to finding all of the solutions to \(A\vec{x} = \vec{0},\) where \(A\) is our matrix of coefficients and \(\vec{x}\) is our vector of vertices. This is also known as the null space of \(A.\) We can reduce \(A\) by Gaussian elimination:</p>


<div data-simplebar>
<p>$$ \begin{bmatrix}
-1 & 0 & 1 & 1 \\\
1 & -1 & 0 & 0 \\\
0 & 1 & -1 & -1 
\end{bmatrix} \quad \rightarrow \quad
\begin{bmatrix}
1 & 0 & -1 & -1 \\\
0 & 1 & -1 & -1 \\\
0 & 0 & 0 & 0 
\end{bmatrix}$$</p>
</div>

<p>This gives us a matrix with two free variables, which we will denote as \(r\) and \(s,\) respectively. If we parameterize all of our coefficients in terms of our free variables, we have the following equations:</p>

$$\alpha = r + s$$
$$\beta = r + s$$
$$\gamma = r$$
$$\delta = s$$

<p>Writing this in vector form yields:</p>
<p>$$\begin{bmatrix}
\alpha \\
\beta \\
\gamma \\
\delta \\
\end{bmatrix} =
r \begin{bmatrix}
1 \\
1 \\
1 \\
0 \\
\end{bmatrix} + s
\begin{bmatrix}
1 \\
1 \\
0 \\
1 \\
\end{bmatrix}$$</p>

<p>This implies that the null space of \(A\) is of two dimensions, and therefore has two basis elements. Thus, \(H(G) = 2.\) We may also garner the same result in a much easier fashion using tools from graph theory. Consider the following definition.</p>

><p><b>Definition 3.6:</b> Consider an arbitrary connected graph \(A.\) A <i>spanning tree</i> is an acyclic connected subgraph \(B \subseteq A\) which contains every vertex of \(A.\)</p>

<p>Naturally, every connected graph has a spanning tree, as it is simply the graph with any edges that form cycles removed. With regards to our graph \(G,\) let our spanning tree \(B\) have edges \(E = \lbrace A, \ B \rbrace.\) Since \(C\) and \(D\) are not included in our spanning tree, we can regard them as cycle forming edges, each of which corresponds to a distinct cycle in the graph. If we subtract the total amount of edges from the non-cycle forming edges in our spanning tree, our result is \(\lbrace A, \ B, \ C, \ D \rbrace \ - |E| = 2.\)</p>

<p>Despite the simplicity of the latter method, we will see in the next two sections that the former generalizes much better to detecting holes of higher dimensions.</p>

---

## Going Further: Simplicies

<p>So, we have a means to compute the amount of holes in the graph topology, but what about other topological spaces, such as the cow and coffee cup we saw earlier? As it turns out, topological graphs are a one-dimensional case of a class of \(n\)-dimensional objects called <i>simplicial complexes</i>. In this section, we will define simplicial complexes and their properties. In the next section, we will show how we can generalize our hole-counting methods to \(n\)-dimensions using these objects.</p>

<p>Consider a set of points \(P = \lbrace p_0, \ p_1 \ \cdots, \ p_k \rbrace \in \mathbb{R}^d.\) We denote a point \(x\) an affine combination of points in \(P\) if \(x = \sum_i^k \lambda_i p_i,\) with the constraint \(\sum_i^k \lambda_i = 1.\) For an example, consider \(\mathbb{R}^2\) with the point set \(S = \lbrace p_0, \ p_1 \rbrace.\) Any point \(x \in \mathbb{R}^2\) which satisfies this constraint will lie on the line segment \(L\) that connects \(p_0\) and \(p_1.\)</p>

<p>We say that \(S\) forms a \(k\)-plane if its elements are <i>affinely independent</i>. Affine independence is when the set of \(k\) vectors \(u_i - u_0\) where \(i = \lbrace 0, \ 1, \ 2, \cdots, \ k \rbrace\) are linearly independent. \(L\) would be a 1-plane in \(\mathbb{R}^2.\) Since we can have \(d\) linearly independent vectors in \(\mathbb{R}^d,\) we can have \(d+1\) affinely independent points.</p>

<center><img img style="width:100%;" src="../post_assets/simplicial_homology/Simplicial_complex.png"></img></center>
<p style="text-align: center;"><i><b>Figure 4.1:</b> A Simplicial Complex; Adapted From <a href="https://commons.wikimedia.org/wiki/File:Simplicial_complex_example.svg">cflm</a></i></p>

<p>Now we will introduce the principal definitions of this section.</p>

><p><b>Definition 4.2:</b> A <i>\(k\)-simplex</i> is the convex hull of \(k + 1\) affinely independent points. A convex hull is simply the smallest convex set that contains a given set of points. Let \(F\) be a subset of the affinely independent points that form our simplex. We denote a <i>face</i> of our simplex as the convex hull of \(F.\)</p>

><p><b>Definition 4.3:</b> A <i>simplicial complex</i> is a finite collection of simplices \(K\) such that \(\sigma \in K\) and \(\tau \subseteq \sigma\) implies \(\tau \in K.\) In addition, \(\sigma,\) \(\sigma_0 \in K\) implies \(\sigma \cap \sigma_0\) is either empty or a face of both. Figure 4.1 shows a simplicial complex containing a variety of \(k\)-simplicies where \(k =\) 0, 1, 2, and 3.</p>

><p><b>Definition 4.4:</b> The <i>dimension</i> of a simplicial complex \(K\) is the maximum dimension of any of its simplices \(s \in K\); \(\dim(K) = \max\limits_{s \in K} \dim(s).\)</p>

><p><b>Definition 4.5:</b> The <i>underlying space</i> \(|K| \) of a simplicial complex \(K\) is the union of its simplicies with the subspace topology inherited from the standard topology of \(\mathbb{R}^{dim(K)}.\)</p>

><p><b>Definition 4.6:</b> A <i>triangulation</i> of a topological space \(T\) is a simplicial complex \(K\) together with a homeomorphism between \(T\) and \(K.\) We denote \(T\) as triangulable if it has a triangulation.</p>

><p><b>Definition 4.7:</b> A <i>subcomplex</i> is a simplicial complex \(H \subseteq K.\)</p>

><p><b>Definition 4.8:</b> A <i>\(j\)-skeleton</i> is a subcomplex of \(K\) whose elements comprise simplicies of dimension \(j\) or less. For example, the 0-skeleton of a simplicial complex \(K\) would be its vertex set.</p>

<center><img img style="max-width:600px; width:100%;" src="../post_assets/simplicial_homology/Torus-triange.png"></img></center>
<p style="text-align: center;"><i><b>Figure 4.9:</b> A Triangulated Torus; Adapted From <a href="https://commons.wikimedia.org/wiki/File:Torus-triang.png">Ag2gaeh</a></i></p>

---

## Simplicial Homology

<p>The goal of this section is to generalize and better formalize the framework we developed in Section 3 by defining <i>homology groups</i>. We will end up seeing many parallels to the structures we developed for graphs. We will begin by generalizing the free abelian groups we introduced in Section 3 to one structure.</p>

><p><b>Definition 5.1:</b> Let \(K\) be a simplicial complex and \(p \in \mathbb{Z}\) a dimension. We define a <i>\(p\)-chain</i> as a formal sum of \(p\)-simplices. This sum is of the form \(\sum_i \alpha_i \sigma_i,\)  where \(\sigma_i\) is a \(p\)-simplex and \(\alpha_i \in \mathbb{Z}_2.\)</p>

<p>We can do component-wise addition with two \(p\)-chains to yield another \(p\)-chain, i.e. \(\sum_i \alpha_i \sigma_i + \sum_i \beta_i \sigma_i = \sum_i (\alpha_i + \beta_i) \sigma_i.\) Under addition modulo 2, \(p\)-chains form a free abelian group, which we will denote as \((C_p, \ +_2),\) where \(C_p\) is a given set of \(p\)-chains.</p>

<p>For each non-negative integer \(p \leq \text{dim}(K),\) there exists a group of \(p\)-chains. We can relate these groups by introducing a boundary homomorphism \(\partial : C_p \rightarrow C_{p-1}.\) We will define the boundary of a \(p\)-chain as the sum of its \((p - 1)\)-dimensional faces. Notice how this is simply a generalization of the boundary operator that we defined on our topological graph \(T\) in Section 3.</p>

<p>To be more explicit, consider an edge \((A \circ B) \in E^* \subseteq T.\) \(T\) forms a simplicial complex, with \(V^*\) and \(E^*\) forming \(j\)-skeletons of dimension 0 and 1, respectively. \(A \circ B\) is a 1-chain in \(T,\) with the form \((\alpha_0 A + \alpha_1 B + \alpha_2 C + \alpha_3 D),\) where \(\alpha_0 = \alpha_1 = 1\) and \(\alpha_2 = \alpha_3 = 0.\) From here on out, we will omit discussion of the latter two terms from this expression since they are both zero-valued.</p>

<p>The simplex \(A\) has faces \(x\) and \(y,\) and \(B\) has faces \(y\) and \(z.\) If we apply the boundary operator, \(y\) is eliminated since it is also shared by the simplex \(B.\)</p>

><p><b>Definition 5.2:</b> For any simplicial complex \(K,\) we define a <i>chain complex</i> as the sequence of \(p\)-chain groups connected by the boundary homomorphism. For completeness, we will consider the boundary homomorphism applied to a 0-skeleton to map to the identity element 0 in a \(p\)-chain where \(p < 0.\)</p>
>
>$$ \cdots \overset{\partial_{p + 2}}{\longrightarrow} C_{p+1} \overset{\partial_{p + 1}}{\longrightarrow} C_{p} \overset{\partial_{p}}{\longrightarrow} C_{p - 1} \overset{\partial_{p - 1}}{\longrightarrow} \cdots $$

<p>Similar to how we generalized the boundary homomorphism to \(p\)-chains, we will now do the same for loops (cycles) that we based the existence of holes in our topological graph \(T\) on.</p>

><p><b>Definition 5.3:</b> A <i>\(p\)-cycle</i> \(C\) is defined as a \(p\)-chain with an empty boundary, \(\partial(C) = 0.\) Since \(\partial\) commutes with addition, the \(p\)-cycles form a subgroup of our group of \(p\)-chains. We will denote this subgroup \(Z_p.\) Notice that \(Z_p\) can also be thought of as the kernel of the \(p\)-th boundary homomorphism. Hence, \(Z_1 = \ker(\partial(C_1)).\)</p>

><p><b>Definition 5.4:</b> A <i>\(p\)-boundary</i> is a \(p\)-chain that is the boundary of a \((p + 1)\)-chain. Just like with the group of \(p\)-cycles, since \(\partial\) commutes with addition, our \(p\)-boundaries form a subgroup of \(p\)-chains. We will denote this subgroup \(B_p.\) Note that \(B_p = \partial(C_{p+1}),\) so we can consider \(B_p\) to be the image of \(\partial_{p+1}.\)</p>

<p>The fundamental property of the boundary group is that the boundary of all its elements is 0. We call this property the <i>fundamental lemma of homology</i>, which we will prove below.</p>

><p><b>Lemma 5.5:</b> (Fundamental Lemma of Homology): \(\partial_p \partial_{p+1} d = 0\) for every \(p \in \mathbb{Z}\) and every \((p+1)\)-chain \(d.\)</p>

<p>We want to show that \(\partial_p \partial_{p+1}d=0\) for a \((p+1)\)-simplex \(d.\) The boundary \(\partial_{p+1}d\) consists of all \(p\)-faces of \(d.\) Every \((p-1)\)-face of \(d\) belongs to exactly two \(p\)-faces, so \(\partial_p\partial_{p+1}d = 0.\)</p>
<p>Naturally, it follows that every \(p\)-boundary is a \(p\)-cycle, and thus \(B_p \leq Z_p.\) This fact is fundamental in the construction of homology groups, since this means we can quotient \(Z_p\) by \(B_p.\)</p>

><p><b>Definition 5.6:</b> The <i>\(p\)-th homology group</i> is the quotient of the \(p\)-th cycle group by the \(p\)-th boundary group, which we will denote as \(H_p = Z_p / B_p.\) The <i>Betti number</i> is the rank of the group, \(\beta_p = \text{rank}(H_p).\)</p>

<p>This definition is significant since the Betti number corresponds exactly to the number of \(p\)-dimensional holes in our simplicial complex. This means that in order to compute a total count of holes in any simplicial complex, we simply have to compute the rank of a given homology group, which is the difference of the ranks of the cycle group and the boundary group, or \(\text{rank}(H_p) = \text{rank}(Z_p) - \text{rank}(B_p).\) This is equivalent to dividing the order of \(Z_p\) by the order of \(B_p.\) Thus, \(\text{rank}(H_p) = \text{ord}(Z_p)/\text{ord}(B_p).\)</p>

<p>To better understand what these homology groups look like, consider the cosets formed by adding all of the \(p\)-boundaries to an arbitrary \(p\)-cycle, \(c + B_p,\) where \(c \in Z_p.\) In this manner, we can generate all other cycles in our simplicial complex and assign them to a set of classes, each class differing from another by their boundaries. If two cycles are in the same homology class, we call them <i>homologous</i>. This means that our homology group quantifies groups of cycles by their shared boundary, and also provides an easy way to count the number of truly independent cycles in a simplicial complex.</p>

---

## References
<p>[1] Adams, Colin Conrad, and Robert David Franzosa. "Introduction to topology: pure and applied." (2008).</p>
<p>[2] Edelsbrunner, Herbert, and John L. Harer. Computational topology: an introduction. American Mathematical Society, 2022.</p>
<p>[3] “Introduction to Algebraic Topology | Algebraic Topology 0 | NJ Wildberger.” YouTube, 9 Mar. 2011, www.youtube.com/watch?v=Ap2c1dPyIVo&amp;list=PL6763F57A61FE6FE8. </p>

---