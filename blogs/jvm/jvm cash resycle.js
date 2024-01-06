function getBlog(){
	return blog = {"content": "# 【jvm详解】垃圾回收\n\n## GC的基本原理\n将内存中不再被使用的对象进行回收，GC中用于回收的方法称为收集器，由于GC需要消耗一些资源和时间，Java在对对象的生命周期特征进行分析后，按照新生代、旧生代的方式来对对象进行收集，以尽可能的缩短GC对应用造成的暂停。\n* 对新生代的对象的收集称为 minor GC\n* 对旧生代的对象的收集称为 Full GC ， Full GC 因为需要对整个堆进行回收，所以更慢\n* 程序中主动调用 System.gc() 强制执行的 GC 为 Full GC\n\n## GC的操作过程\n当对象在堆创建时，将进入新生代的 Eden Space。垃圾回收器进行垃圾回收时，扫描 Eden Space 和 Suvivor Space 的 From 区，如果对象仍然可以存活，则复制到 Suvivor Space 的 To 区，如果 Suvivor Space 的 To 区已经满了，则复制到旧生代，同时，在扫描 Suvivor Space 时，如果对象已经经过了几次的扫描仍然存活（默认值为15次以上），JVM认为其为一个持久化对象，则直接将其移到旧生代。\n\n## 不同的对象引用类型，GC会采用不同的方法进行回收，JVM对象的引用分为了四种类型\n* 强引用：默认情况下，对象采用的均为强引用。这个对象的实例没有其他对象引用，GC时才会被回收\n* 软引用：软引用是Java中提供的一种比较适合于缓存场景的应用。只有在内存不够用的情况下才会被GC\n* 弱引用：在GC时一定会被GC回收\n* 虚引用：虚引用只是用来得知对象是否被GC\n\n## 垃圾收集算法\n* 标记-清除算法：分为“标记”和“清除”阶段：首先标记出所有不需要回收的对象，在标记完成后统一回收掉所有没有被标记的对象。\n* 标记-复制算法：为了解决“标记-清除”算法的效率问题，“标记-复制”收集算法出现了。它可以将内存分为大小相同的两块，每次使用其中的一块。当这一块的内存使用完后，就将还存活的对象复制到另一块去，然后再把使用的空间一次清理掉。这样就使每次的内存回收都是对内存区间的一半进行回收。\n* 标记-整理算法：它是根据老年代的特点提出的一种标记算法，标记过程仍然与“标记-清除”算法一样，但后续步骤不是直接对可回收对象回收，而是让所有存活的对象向一端移动，然后直接清理掉端边界以外的内存。\n* 分代收集算法（常用）：当前虚拟机的垃圾收集都采用分代收集算法，这种算法没有什么新的思想，只是根据对象存活周期的不同将内存分为几块。一般将 java 堆分为新生代和老年代，这样我们就可以根据各个年代的特点选择合适的垃圾收集算法。比如在新生代中，每次收集都会有大量对象死去，所以选择”标记-复制“算法，只需要付出少量对象的复制成本就可以完成每次垃圾收集。而老年代的对象存活几率是比较高的，而且没有额外的空间对它进行分配担保，所以选择“标记-整理”算法进行垃圾收集。\n\n## 垃圾收集器\n垃圾收集算法是内存回收的方法论，垃圾收集器是内存回收的具体实现。\n* Serial 收集器\n* ParNew 收集器\n* Parallel Scavenge 收集器（JDK1.8 默认的垃圾收集器）\n* Serial Old 收集器\n* Parallel Old 收集器\n* CMS 收集器\n* G1 收集器\n* ZGC 收集器", "title": "【jvm详解】垃圾回收"}
}