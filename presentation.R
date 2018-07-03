plo = material.toxicity;
boxplot(formula = Toxicity~is.toxic,
        data = plo,
        main = "Toxicity levels of nanoparticles",
        xlab = "toxic or not",
        ylab = "Measured levels of toxicity",
        col = c("#e06666","#39ff14"))

#toxic min 2.290
#safe  max 2.602
doThing = function(thresh, plo){
  #par1 is threshhold
  tt = length(plo[plo$Toxicity>thresh & plo$is.toxic,1]);
  fp = length(plo[plo$Toxicity>thresh & !(plo$is.toxic),1]);
  fn = length(plo[!(plo$Toxicity>thresh) & plo$is.toxic,1]);
  tn = length(plo[!(plo$Toxicity>thresh) & !(plo$is.toxic),1]);
  
  
  return (c(tt, fp, fn, tn))
}
#toxicity = damaged cells/volume
#iamstillconfused
#all is clear okie
#youre presenting hellnaw not this part for sure
resulting = doThing(2.3, plo)







