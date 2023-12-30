---
author: "Michael Lilley"
title: "A Primer on Tensors"
date: "2023-06-08"
description: "In this post, we'll be taking a brief look at tensors. These can be confusing objects to understand, but are central to many areas in mathematics, physics, and computer science."
summary: "In this post, we'll be taking a brief look at tensors. These can be confusing objects to understand, but are central to many areas in mathematics, physics, and computer science."
tags: ["tensors", "physics", "linear-algebra"]
cover:
    image: tensor_cover.png # image path/url
    hidden: true
---

---



## Introduction

<p>If you're familiar at all with physics, you might have heard the term <i>tensor</i> get thrown around from time to time, perhaps in the context of the <i>stress-energy tensor</i>. In the Fall of 2019, I registered for my second semester of a two-part course my university offered on data structures and algorithms. My now late professor was very exhuberent about the development of quantum computing, and spent some time at the beginning of the term talking about the fundamentals. If you're unfamilar, the basic idea of quantum computing is that if we utilize the properties that systems of particles have to store and act as processing pipelines of information, we can exhibit massive computational speedups for a select few imporant problems. This is a paradigm at odds with classical computation, whose operation primarily relies on digital signal processing and transistor circuits. </p>

<p> Quantum computing and quantum circuits are typically described in the language of linear algebra. The analogous notion of information to the bit, the <i>qubit</i>, is represented as a unit vector in \(\mathbb{C}^2,\) and logic gates are typically constructed as square matrices, since these induce an endomorphism (read: transformation which maps elements of a vector space back onto that same vector space). As mentioned before, much of the power which comes from quantum models is a result of considering systems of particles in an ensemble; typically in a way such that they are coupled to one another. This coupling comes in the form of <i>quantum entanglement</i>, a situation in which the quantum state of an entangled particle cannot be described independently of the other particles it is entangled with. </p>

<p> We describe this coupling (but not yet entanglement) mathematically utilizing an operation \(\otimes\) called the <i>Kronecker product</i>, which is a generalization of the outer product between vectors. This operation takes two matrices of arbitrary size and produces a block matrix.</p>

><p><b>Definition 1.1:</b> Let A be a \(m \times n\) matrix and B be a \(p \times q\) matrix; then, the <i>Kronecker Product</i> \(\otimes\) applied as \(A \otimes B\) produces a \(pm \times qn\) matrix as follows: </p>
>
>$$A \otimes B = \begin{bmatrix}
>a_{11}B & \dots & a_{1n}B \\\
>\vdots & \ddots & \vdots \\\
>a_{m1}B & \dots & a_{mn}B
>\end{bmatrix}$$ 

<p>Using two qubits as an example, if \(A = \begin{bmatrix} 1 \\ 0 \end{bmatrix} \) and \(B = \begin{bmatrix} 0 \\ 1 \end{bmatrix} ,\) then \(A \otimes B \) = \(\begin{bmatrix} 0 \\ 1 \\ 0 \\ 0 \end{bmatrix} .\)</p>

<p>The Kronecker product is a matrix representation of a much more generalizable operation called the <i>tensor product</i>, which is the more common name seen in literature. Tensors are particularly challenging to understand at first, mostly as a result of their generality. I found that different sources provided definitions at different levels of abstraction, and finding a general definition which encapsulated all of these wasn't trivial.</p>

<p>In this post, we'll be restricting ourselves to finite-dimensional vector spaces. Despite the already immense generality that exists here, we can go even further and start talking about vector spaces of infinite dimensions or tensors with respect to modules, the construction of which relies on quite a bit of category theory. In addition, we will also be assuming that we can construct the bases of any vector spaces we describe in the section on the tensor product. Making these arguments without explicitly referring to bases is possible, but requires some mental gymnastics. </p>

---

## A First Look at Tensors

><p><b>Definition 2.1:</b> Let \(V = \lbrace V_1, V_2, \cdots, V_n, W \rbrace \) be a set of vector spaces over a common field \(\mathbb{F}.\) A <i>tensor</i> is a multilinear map \(f: V_1 \times \cdots \times V_n \rightarrow W .\)</p>

<p>Recall that multilinear means the mapping is linear in each variable. That is to say, if we fix all other variables but one, the mapping is linear (also known as a one-form). A canonical example of a tensor is a linear functional over a vector space. A linear functional maps from a vector space back to its ground field, and since a field is a vector space over itself we can say that a linear functional constitutes a tensor.</p>

<p>For instance, consider the vector space \(\mathbb{R}^3 .\) Denoting elements of \(\mathbb{R}^3 \) by column vectors, we may say that the linear functionals consist of all real-valued \(1 \times 3 \) row vectors. The set of linear functionals of a vector space is also known as its dual space. As a result, all elements of the dual space of a vector space are tensors. Conversely, all elements of a vector space are tensors, as they map elements of their dual space back to the ground field. </p>

<p>For another example, consider the vector space \(M_n (\mathbb{F}) .\) All elements of this vector space are tensors, as they are linear operators which map from \( \mathbb{F}^n \) to \( \mathbb{F}^n .\) As was mentioned before, tensors do not need to be represented by a matrix; they simply need to be a multilinear map. For a final example, consider the dot product as a tensor; if we fix one of the operands, the dot product becomes a linear transformation. </p>

<p>We will now define the tensor product, which as described earlier, is a generalization of the Kronecker product, as it is defined in terms of vector spaces and mappings, rather than just matrices. Note that the tensor product and Kronecker product share the same symbol.</p>

<div data-simplebar>

><p> <b>Definition 2.2:</b> Let \(V_1 \) and \(V_2 \) be vector spaces over a common field \(\mathbb{F}.\) The result of the <i>tensor product</i> \(V_1 \otimes V_2 \) is the vector space formed by quotienting the free module \( F(V_1 \times V_2) \) by a relation \(\sim ,\) defined by: </p>
><ul>
><li>Identity:\(\ (v,w) \sim (v,w)\)</li>
><li>Symmetry: \( (v,w) \sim (v',w') \implies (v',w') \sim (v,w)\)</li>
><li>Transitivity: \( \ (v,w) \sim (v',w') \mbox{ and } (v',w') \sim (v'',w'') \implies (v,w) \sim (v'',w'')\)</li>
><li>Distribution: \( (v,w) + (v',w) \sim (v + v',w') \mbox{ and } (v,w) + (v,w') \sim (v,w + w')\)</li>
><li>Scalar Multiples: \( c(v,w) \sim (cv,w) \mbox{ and } c(v,w) \sim (v,cw)\)</li>
></ul>
> where \( (v,w) ,\)\( (v',w') \in F(V_1 \times V_2) .\) So, \(V_1 \otimes V_2 := F(V_1 \times V_2) \backslash \sim .\)

</div>

<p>Using Definition 2.2, we may redefine the tensor using a different, but equivalent definition:</p>

><p> <b>Definition 2.3:</b> Let \(S = \lbrace V_1, V_2, \cdots, V_n \rbrace \) be a set of vector spaces over a common field \(\mathbb{F}.\) We define a <i>tensor</i> as an element of the tensor product \(V_1 \otimes V_2 \otimes \cdots \otimes V_n .\) A <i>tensor on the vector space \(V \)</i> is defined to be an element of the tensor product \(V \otimes \cdots \otimes V \otimes V^* \otimes \cdots \otimes V^* ,\) where \(V^* \) is dual space of \(V .\)</p>

<p>Recall that the dual space \(V^* \) of a vector space \(V \) is the vector space over the same field \( \mathbb{F} \) whose elements is the set of one-forms on \(V ,\) where a one-form is a linear mapping from a vector space to its ground field. We often say that tensors corresponding to the second definition are of type \( (m,n) ,\) where \(m \) is the number of copies of \(V \) and \(n \) is the number of copies of \(V^* .\) A tensor of type \( (1,0) \) is just a vector.</p>

<p>We may also define the tensor product between linear maps.</p>

><p> <b>Definition 2.4:</b> Let \(F: W \rightarrow Y \) and \(G: X \rightarrow Z \) be linear maps. The result of the <i>tensor product</i> \(F \otimes G \) is the linear map \(F \otimes G: W \otimes X \rightarrow Y \otimes Z .\) </p>

<p>The tensor product is denoted so because it provides a natural correspondence between mutltilinear maps and linear maps, allowing us to reduce problems of multilinear algebra to linear algebra. This relationship is actually injective; given by something called the <i>universal property</i>, which will we will state without proof: </p>

><p> <b>Theorem 2.5 (universal property):</b> Let \( L(V_1, V_2, \cdots, V_p; V) \) be the set of multilinear functions which map between \(V_1 \times \cdots \times V_n \rightarrow V .\)
>For any multilinear functional \(F \in L(V_1, V_2, \cdots, V_p; V) ,\) there exists a unique linear transformation T such that \( F(v_1, v_2, \cdots, v_p) = T(v_1 \otimes v_2 \otimes \cdots \otimes v_p) .\)</p>

<p>In matrices, this transformation is given immediately by a property of the Kronecker product. If we consider A and B as matrices of linear maps and if \(A \) and \(B \) are matrices, and \(v \) and \(w \) are vectors, then \(Av \otimes Bw \) = \((A \otimes B)(v \otimes w) .\)</p>

---

## Interpreting Tensors in a Physical Sense

<p>Tensors are often characterized by the fact that their components exhibit certain transformations under a change of coordinates. These transformations are a particularly important property when applying tensors to various physical problems. In this section, we'll be examining these transformations and why they are important.</p>

<p>A common procedure to perform when working in a vector space is a <i>change of basis</i>. As the name suggests, this is a procedure in which we change the representation of a given vector space \(V \) by means of constructing a different set of basis vectors. Understanding how multilinear transformations (and their notational representations) transform under a change of basis is key to understanding how to apply them in other coordinate systems. To motivate these transforms, consider the following example:</p>

><p> <b>Example 3.1:</b> Consider the vector space \(\mathbb{R}^2 ,\) represented by the standard basis vectors. If we expand the vector \(A = \begin{bmatrix} 2 \\ 4 \end{bmatrix} \) into its coefficients and basis vectors, we have:</p>
>
>$$A = a_1 \hat{i} + a_2\hat{j} = 2 \begin{bmatrix} 1 \\\ 0 \end{bmatrix} + 4 \begin{bmatrix} 0 \\\ 1 \end{bmatrix} $$
>
><p>If we perform a change of basis so that our new basis is \(\mathcal{B} = \bigg\lbrace \begin{bmatrix} 2 \\ 0 \end{bmatrix}, \begin{bmatrix} 0 \\ 2 \end{bmatrix} \bigg\rbrace ,\) we would instead expand \(A \) as: </p>
>
>$$A = (a_1/2) \mathcal{B}_1 + (a_2/2) \mathcal{B}_2 = \begin{bmatrix} 2 \\\ 0 \end{bmatrix} + 2 \begin{bmatrix} 0 \\\ 2 \end{bmatrix} $$

<p>By doubling our basis vectors, we had to halve our coefficients in order to represent the same vector in \(\mathbb{R}^2 .\) Generally, coefficients always change contrary to the basis vectors under a change of basis.</p>

<p>Now, consider the function \(f = \sin(x) + y^2\) and its gradient \(\nabla f = \cos(x) + 2y.\) Under that same change of basis, we can represent the old coordinates as a function of the new coordinates, and therefore describe the gradient in the old coordinates as a function of the gradient in the new coordinates. Let \(x' = 2x \) and \(y' = 2y ,\) (where \(x'\) and \(y'\) are the terms representative of the new bases) so that the function expressed in the new basis as \(f = \sin(x') + (y')^2 .\)</p>

<p>Substituting yields \(f = \sin(2x) + (2y)^2.\) Now if we take the gradient, we get:</p>

$$\nabla f = 2\cos(2x)+ 2(2y) = 2\cos(x') + 2(y') $$

<p>Following a scaling of the basis, we find that the gradient of \(f \) also scales in the same manner, which is the opposite behavior we observe compared to the coordinates. This example illustrates the two primary types of transformations which occur to components of a tensor following a change of basis: <i>contravariant</i> and <i>covariant</i>. Components which transform in a contravariant manner do so <i>contra</i>ry to the transformation which the basis vectors undergo, whereas those which do so in a covariant manner do so in the same manner as the basis vectors.</p>

<p>Tensors can have components which are entirely contravariant, covariant, or a mix of the two. To indicate which components transform in which manner, we use a mix of subscript and superscript notation, with the former corresponding to contravariant components and the latter to covariant components. For instance, we would write the vector \(A \) as follows:</p>

$$A = \sum_{i}a^iB_i = a^1 \hat{i} + a^2\hat{j} $$

<p>This style is known as <i>Einstein notation</i>.</p>

---

## The Cauchy Stress Tensor

<p>There are many important tensors that are used in the mathematical sciences; one such example is the Cauchy Stress Tensor, found in continuum mechanics. This tensor describes the stress at any point in a solid object, and has components that transform contravariantly. While representative of an object in three dimensions, the tensor has nine values. One might reason that we only need three values corresponding to the stresses in the \(x ,\) \(y ,\) and \(z \) directions, but physical stress does not adhere to standard vector addition rules; if I push on a box using the same force from two opposite sides, the total stress on the box is not zero.</p>

<center><img style="max-width:550px; width:100%;" src="../post_assets/structure_tensor/tensor_cover.png"></img></center>
<p style="text-align: center;"><i><b>Figure 4.1:</b> The Cauchy Stress Tensor; Adapted From <a href="https://commons.wikimedia.org/wiki/File:Components_stress_tensor.svg">Sanpaz</a></i></p></i></p>

<p>To model stress at a point, we aim to describe the three-dimensional stress an object could undergo at each of its faces. To treat this in a semi-formal manner, consider splitting our object into small cubes, with one such cube denoted by the tuple \( C = (s_{x,1}, s_{x,2}, s_{y,1}, s_{y,2}, s_{z,1}, s_{z,2}) \) where \(s_{x,1} \) and \(s_{x,2}\) are stresses on directly opposite faces perpendicular to the x-axis, and the face area denoted by \(\Delta A .\) By physical experimentation, it has been found that: </p>

<p>$$ \lim_{\Delta A \rightarrow 0} s_{i,1} - s_{i,2} = 0 , \ i = x,y,z$$</p>

<p>This observation is called Cauchy's Fundamental  Lemma of Continuum Mechanics. As a result, we only need 9 numbers rather than 18 to hold the information of stress on all faces at a particular point in an object, as \(s_{i,1} = - s_{i,2} .\) Conventionally, the stress tensor is denoted as:</p>

$$\sigma =  \begin{bmatrix}
\sigma_{x,x} & \sigma_{x,y} & \sigma_{x,z} \\\
\sigma_{y,x} & \sigma_{y,y} & \sigma_{y,z} \\\
\sigma_{z,x} & \sigma_{z,y} & \sigma_{z,z}
\end{bmatrix} $$ 

<p>To retrieve the stress at a particular face, we simply need to take the dot product of the stress tensor with a unit row vector. For instance: </p>

<div data-simplebar>
<p>$$ \begin{bmatrix}
1 & 0 & 0 \\
\end{bmatrix} \ \cdot \begin{bmatrix}
\sigma_{x,x} & \sigma_{x,y} & \sigma_{x,z} \\
\sigma_{y,x} & \sigma_{y,y} & \sigma_{y,z} \\
\sigma_{z,x} & \sigma_{z,y} & \sigma_{z,z}
\end{bmatrix} = \begin{bmatrix}
\sigma_{x,x} & \sigma_{x,y} & \sigma_{x,z}
\end{bmatrix} $$</p>
</div>

<p>Since the exact coefficients of the stress tensor are dependent upon the material of the object as well as the exact types of forces that are being applied, we will not go through a computation for this, and will end the post here. Despite this, it is my hope that you have found this to be a useful introduction to tensors.</p>

---

## References

<p>[1] Irgens, Fridtjov. Continuum mechanics. Springer Science & Business Media, 2008.</p>
<p>[2] Treil, Sergi. "Linear algebra done wrong." (2016).</p>
<p>[3] Treves, François. Topological Vector Spaces, Distributions and Kernels: Pure and Applied Mathematics, Vol. 25. Vol. 25. Elsevier, 2016.</p>
<p>[4] Stover, Christopher and Weisstein, Eric W. "Einstein Summation." From MathWorld--A Wolfram Web Resource.</p>

---